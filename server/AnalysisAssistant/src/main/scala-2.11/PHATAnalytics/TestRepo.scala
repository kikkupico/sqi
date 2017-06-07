package PHATAnalytics

import scala.collection.mutable.Map
import better.files._
import sys.process._

/**
  * Created by ramaveer on 12/28/2016.
  */

class FileCacheItem(val path:String, val handle:Option[File])

object TestRepo {

  val dataCache = Map[String, String]()
  val fileCache = Map[String, FileCacheItem]()

  //val rootNBI = "C:\\ph6_automation\\phat\\ci-plat-soap-ui\\project\\" //dev/local rootNBI
  //val rootUI = "C:\\ph6_automation\\phat\\phat_core\\src\\main\\test_scripts\\" //dev/local rootUI
  val rootNBI = "/opt/phat_ram/ph-automation/phat/ci-plat-soap-ui/project/" //production rootNBI
  val rootUI = "/opt/phat_ram/ph-automation/phat/phat_core/src/main/test_scripts/" //production rootUI

  def locateTestCaseFileNBI(project:String, testSuite:String, testCase:String):FileCacheItem = {

    println("Data not found in cache. Trying to get from disk...")

    val projectFolder = (rootNBI + "/" + project ).toFile

    if(projectFolder.isEmpty) {
      new FileCacheItem("Project not found", None)
    }

    else {
      val testSuiteFolder = (rootNBI + "/" + project + "/" + testSuite).toFile

      if(testSuiteFolder.isEmpty) {
        //try to see if test suite has been renamed
        (rootNBI + project + "/").toFile
                .glob("**/settings{.xml}")
                .find((f: File) => f.contentAsString contains "name=\"" + testSuite + "\"") match {
                  case None => new FileCacheItem("Test suite not found", None)
                  case Some(settingsXML) => {
                    val testCaseFile = settingsXML.parent.glob("**/*{.xml}")
                      .find((f2: File) => f2.contentAsString contains "name=\"" + testCase + "\"")
                    testCaseFile match {
                      case None => new FileCacheItem("Test case not found in folder " + settingsXML.parent.pathAsString.replace(rootNBI, ""), None)
                      case Some(file) => new FileCacheItem(file.pathAsString, testCaseFile)
                    }
                  }
                }
      }

      else {
        val testCaseFile = testSuiteFolder.glob("**/*{.xml}")
          .find((f: File) => f.contentAsString contains "name=\"" + testCase + "\"")
        testCaseFile match {
          case None => new FileCacheItem("Test case not found", None)
          case Some(file) => new FileCacheItem(file.pathAsString, testCaseFile)
        }
      }
    }
  }

  def locateTestCaseFileUI(project:String, testSuite:String, testCase:String):FileCacheItem = {
    val path = project.toLowerCase + '/' + testSuite + '/' + testCase
    new FileCacheItem(path, rootUI.toFile.glob("**/*.*").find(f => f.pathAsString contains testCase))
  }

  def getTestCaseXML(project: String, testSuite: String, testCase: String):String = {
    dataCache.getOrElseUpdate(project+"/"+testSuite+"/"+testCase,
      {
        val result:FileCacheItem = project.toLowerCase match {
          case "regression" => fileCache.getOrElseUpdate(project+"/"+testSuite+"/"+testCase, locateTestCaseFileUI(project, testSuite, testCase))
          case "sanity" => fileCache.getOrElseUpdate(project+"/"+testSuite+"/"+testCase, locateTestCaseFileUI(project, testSuite, testCase))
          case _ => fileCache.getOrElseUpdate(project+"/"+testSuite+"/"+testCase, locateTestCaseFileNBI(project, testSuite, testCase))
        }

        result.handle match {
          case None => "ERROR: " + result.path
          case Some(f) => f.contentAsString
        }
      }
    )
  }

  def getTestCaseEditHistory(project: String, testSuite: String, testCase: String):String = {
    dataCache.getOrElseUpdate(project+"/"+testSuite+"/"+testCase+"/editHistory",
      {
        val result:FileCacheItem = project.toLowerCase match {
          case "regression" => fileCache.getOrElseUpdate(project+"/"+testSuite+"/"+testCase, locateTestCaseFileUI(project, testSuite, testCase))
          case "sanity" => fileCache.getOrElseUpdate(project+"/"+testSuite+"/"+testCase, locateTestCaseFileUI(project, testSuite, testCase))
          case _ => fileCache.getOrElseUpdate(project+"/"+testSuite+"/"+testCase, locateTestCaseFileNBI(project, testSuite, testCase))
        }

        result.handle match {
          case None => "ERROR: " + result.path
          case Some(f) => {
            val editHistory = Process(
              Seq(
                "git",
                "log",
                "-p",
                "--pretty=format:[%cD : \\\"%s\\\" by %an]",
                "--follow",
                f.pathAsString
              ),
              new java.io.File(rootNBI)
            ).!!

            if(editHistory.isEmpty) "No edits found"
            else editHistory
          }
        }
      }
    )
  }

  def getLogFileNames(vm:String, folder: String, grepString: String):String = {
    // ssh phat2@bxb-phat1-lnx ls /opt/nbi-reports/TR-157-31-01-2017_19_47_42 | grep install_Unique_module
    println("Getting log files list...")
    val logList = vm match {
      case "bxb-phat1-lnx" => ("ssh phat2@bxb-phat1-lnx ls /opt/nbi-reports/" + folder + " | grep " + grepString).!! //when reports are in phat1 and analytics server is in phat3
      case "bxb-phat3-lnx" => (s"ls /opt/nbi-reports/$folder"  #| s"grep $grepString").!! //when both reports and analytics server are in phat3
      case _ => "No implementation found for given host"
    }
    logList
  }

  def performGitPull() = {
    dataCache.clear
    Process(Seq("git","pull"), new java.io.File(rootNBI)).!!
  }
}
