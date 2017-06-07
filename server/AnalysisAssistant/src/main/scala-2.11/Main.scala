package prog

import java.net.URLDecoder
import java.util.{Timer, TimerTask}

import io.finch.{stringBody, _}
import com.twitter.finagle.Http
import com.twitter.finagle.http.filter.Cors
import com.twitter.finagle.Service
import com.twitter.finagle.http.{Request, Response}
import com.twitter.util.{Await, FuturePool}
import PHATAnalytics._

object Main extends App {

  val t = new Timer()
  val task = new TimerTask {
    def run() = PhatDb.reload
  }

  t.schedule(task, 0L, 7200000L)

  val analysisNoteParams: Endpoint[AnalysisNote] = Endpoint.derive[AnalysisNote].fromParams

  val bodyEndpoint: Endpoint[String] = stringBody

  val nightlyFailures: Endpoint[String] = get("nightlyData" :: "detailed") { println("Req:nightlyData/detailed"); Ok(PhatDb.getNightlyResults) }

  val reloadDB: Endpoint[String] = post("reloadDB") { println("Req:reloadDB"); Ok(PhatDb.reload ) }

  val deploymentData: Endpoint[String] = get("deploymentData") { println("Req:deploymentData"); Ok(PhatDb.getDeploymentData ) }

  val nightlyLinks: Endpoint[String] = get("nightlyData" :: "links") { println("Req:nightlyData/links"); Ok(PhatDb.getNightlyLinks) }

  val nightlyOverallTrends: Endpoint[String] = get("nightlyData" :: "overallTrends") { println("Req:nightlyData/trends"); Ok(PhatDb.getOverallTrends) }

  val mostRecentAnalyses: Endpoint[String] = get("mostRecentAnalyses") {
    println("Req:mostRecentAnalyses")
    FuturePool.unboundedPool {
      Ok(PhatDb.getMostRecentAnalyses)
    }
  }.handle {
    case e: Error.NotPresent => InternalServerError(e)
  }

  val analysisDataForReport: Endpoint[String] = get("analysisDataForReport" :: analysisNoteParams) {
    (a: AnalysisNote) => {
      println("Req:mostRecentAnalyses")
      FuturePool.unboundedPool {
        Ok(PhatDb.getDataForAnalysisReport(a))
      }
    }.handle {
      case e: Error.NotPresent => InternalServerError(e)
    }
  }

  val getTestCaseXMLEP: Endpoint[String] = get(string :: string :: string) {
    (project: String, testSuite: String, testCase:String) => { println("Req:getNBITestCaseXML"); Ok(TestRepo.getTestCaseXML(URLDecoder.decode(project, "UTF-8"), URLDecoder.decode(testSuite, "UTF-8"), URLDecoder.decode(testCase, "UTF-8"))) }
  }

  val getTestCaseGitEP: Endpoint[String] = get(string :: string :: string :: "editHistory") {
    (project: String, testSuite: String, testCase:String) => {
      FuturePool.unboundedPool {
        println("Req:getNBITestCaseGit")
        Ok(TestRepo.getTestCaseEditHistory(URLDecoder.decode(project, "UTF-8"), URLDecoder.decode(testSuite, "UTF-8"), URLDecoder.decode(testCase, "UTF-8")))
      }
  }.handle {
    case e: Error.NotPresent => InternalServerError(e)
    }
  }

  val getLogFileNames: Endpoint[String] = get("logFiles" :: string :: string :: string) {
    (vm: String, folder: String, grepString:String) => { println("Req:getNBILogFiles"); Ok(TestRepo.getLogFileNames(URLDecoder.decode(vm, "UTF-8"), URLDecoder.decode(folder, "UTF-8"), URLDecoder.decode(grepString, "UTF-8"))) }
  }

  val getParallellyExecTscriptsEP: Endpoint[String] = get("parallelScripts" :: string :: string :: string :: string) {
    (customer: String, version: String, start_time: String, end_time: String) => { println("Req:getParallellyExecTscripts"); Ok(PhatDb.getParallellyExecTscripts(URLDecoder.decode(customer, "UTF-8"), URLDecoder.decode(version, "UTF-8"), URLDecoder.decode(start_time, "UTF-8"), URLDecoder.decode(end_time, "UTF-8"))) }
  }

  val putAnalysisNote: Endpoint[String] = put("analysisNote" :: analysisNoteParams :: stringBody) {
    (a: AnalysisNote, bodyText: String) => {
      println("Req:putAnalyses")
      FuturePool.unboundedPool {
        println("Req:Add analysis note")
        if(bodyText.nonEmpty) Ok(PhatDb.insertAnalysis(AnalysisNote(a.customer,a.version,a.project,a.testSuite,a.testCase,a.failureType,Some(bodyText),a.reportDate, a.defectID)))
        else Ok(PhatDb.insertAnalysis(a))
      }
    }.handle {
      case e: Error.NotPresent => InternalServerError(e)
    }
  }

  val updateAnalysisNote: Endpoint[String] = post("analysisNote" :: int :: analysisNoteParams :: stringBody) {
    (id: Int, a: AnalysisNote, bodyText: String) => {
      println("Req:mostRecentAnalyses")
      FuturePool.unboundedPool {
        println("Req:Add analysis note")
        val res = if(bodyText.nonEmpty) PhatDb.updateAnalysis(AnalysisNote(a.customer,a.version,a.project,a.testSuite,a.testCase,a.failureType,Some(bodyText),a.reportDate, a.defectID), id) else PhatDb.updateAnalysis(a, id)
        res match {
          case "Invalid ID" => BadRequest(new NoSuchElementException(res))
          case "Nothing to update" => BadRequest(new NoSuchElementException(res))
          case _ => Ok(res)
        }
      }
    }.handle {
      case e: Error.NotPresent => InternalServerError(e)
    }
  }

  val getAnalysisNotes: Endpoint[String] = get("analysisNotes" :: analysisNoteParams) {
    (a: AnalysisNote) => {
      println("Req:gettAnalyses")
      FuturePool.unboundedPool {
        println("Req:Get analysis note")
        Ok(PhatDb.getAnalysis(a))
      }
    }.handle {
      case e: Error.NotPresent => InternalServerError(e)
    }
  }

  val updateGit:Endpoint[String] = post("updateGit") { println("Req:updateGit"); Ok(TestRepo.performGitPull())}

  val policy: Cors.Policy = Cors.Policy(
    allowsOrigin = _ => Some("*"),
    allowsMethods = _ => Some(Seq("GET", "POST", "PUT")),
    allowsHeaders = _ => Some(Seq("Accept"))
  )

  val corsService: Service[Request, Response] = new Cors.HttpFilter(policy)
    .andThen((updateAnalysisNote :+: analysisDataForReport :+: mostRecentAnalyses :+: updateGit :+: putAnalysisNote :+: getAnalysisNotes :+: reloadDB :+: deploymentData :+: nightlyFailures :+: nightlyLinks :+: nightlyOverallTrends :+: getLogFileNames :+: getTestCaseXMLEP :+: getTestCaseGitEP  :+:getParallellyExecTscriptsEP).toServiceAs[Text.Plain])
  println("Server Running. Press Ctrl+C to quit")
  Await.result(Http.server.serve(":8085", corsService))

}
