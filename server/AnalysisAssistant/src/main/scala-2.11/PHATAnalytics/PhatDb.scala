package PHATAnalytics

import java.sql.{DriverManager, ResultSet}
import scala.collection.mutable.ArrayBuffer

/**
  * Created by ramaveer on 12/28/2016.
  */
object PhatDb {

  var cachedFailureResults:String = "DB data is being loaded; please retry after some time"
  var cachedLinks:String = "DB data is being loaded; please retry after some time"
  var cachedOverallTrends:String = "DB data is being loaded; please retry after some time"
  var cachedDeploymentData:String =  "DB data is being loaded; please retry after some time"

  def getNightlyResults = cachedFailureResults
  def getNightlyLinks = cachedLinks
  def getOverallTrends = cachedOverallTrends
  def getDeploymentData = cachedDeploymentData

  def reload = {
    println("Loading DB data... ")
    cachedFailureResults = getNightlyResultsLive
    cachedLinks = getNightlyLinksLive.reduce {_ + "\n" + _}
    cachedOverallTrends = getOverallTrendsLive.reduce {_ + "\n" + _}
    cachedDeploymentData = getDeploymentDataLive.reduce {_ + "\n" + _}
    println("DB data loaded successfully")
    "DB data loaded successfully"
  }

  private def getNightlyResultsLive = {
    println("Getting nightly results...")
    var results = "report_date,customer,version,project,test_suite,test_case,status,start_time,end_time,trend,trend_dates\n"
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    // Configure to be Read Only
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    // Execute Query
    val rs = statement.executeQuery("select * from regression.data_for_analysis_combined where report_date >= current_date")

    // Iterate Over ResultSet
    while (rs.next) {
      results += rs.getString("report_date") + "," + rs.getString("customer") + "," + rs.getString("version") +  "," + rs.getString("project") +  "," + rs.getString("test_suite") +  "," + rs.getString("test_case") +  "," + rs.getString("status") + "," + rs.getString("start_time") + "," + rs.getString("end_time") +  "," + rs.getString("trend") +  "," + rs.getString("trend_dates") + "\n"
    }

    conn.close
    println("Got nightly results.")
    results
  }

  private def getNightlyLinksLive = {
    println("Getting nightly links...")
    val results = scala.collection.mutable.ArrayBuffer.empty[String]
    results += "execution_date,customer,version,project,report_link"
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    // Configure to be Read Only
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    // Execute Query
    val rs = statement.executeQuery("select  DISTINCT on (execution_date, phcustomer, buildid, executionname) executiondate::date as execution_date, phcustomer, buildid, CASE WHEN executionname like 'Regression%' THEN 'UI-Regression' WHEN executionname like 'Sanity%' THEN 'UI-Sanity' ELSE executionname END, dashboardlink, summaryreporturl from public.unifiedreport where executiondate >= current_date - interval '9 days' order by execution_date, phcustomer, buildid, executionname, executiondate desc")

    // Iterate Over ResultSet
    while (rs.next) {
      results += rs.getString("execution_date") + "," + rs.getString("phcustomer") + "," + rs.getString("buildid") +  "," + rs.getString("executionname") +  "," + rs.getString("summaryreporturl")
    }

    conn.close
    println("Got nightly links.")
    results
  }

  private def getOverallTrendsLive = {
    println("Getting nightly trends...")
    val results = scala.collection.mutable.ArrayBuffer.empty[String]
    results += "execution_date,customer,version,project,pass_trend,total_trend,trend_dates,passedtestcase,failedtestcase,totaltestcases"
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    // Configure to be Read Only
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    // Execute Query
    //val rs = statement.executeQuery("select * from regression.data_for_analysis where (status ='Failure' or status='Success') and execution_date >= current_date - interval '1 day' and execution_date < current_date")
    val rs = statement.executeQuery("select * from public.overall_trends where execution_date > current_date - interval '1 day'")

    // Iterate Over ResultSet
    while (rs.next) {
      results += rs.getString("execution_date") + "," + rs.getString("phcustomer") + "," + rs.getString("buildid") +  "," + rs.getString("executionname") +  "," + rs.getString("trend") +  "," + rs.getString("total_trend") +  ","+ rs.getString("trend_dates") +  ","+ rs.getString("passedtestcase") +  ","+ rs.getString("failedtestcase") +  ","+ rs.getString("totaltestcases")
    }

    conn.close
    println("Got nightly trends.")
    results
  }

  private def getDeploymentDataLive = {
    println("Getting deployment data...")
    val results = scala.collection.mutable.ArrayBuffer.empty[String]
    results += "deployment_timestamp,customer,version,db,log_timestamp,class,title,description"
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    // Configure to be Read Only
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    // Execute Query
    val rs = statement.executeQuery("select public.deployments.timestamp as deployment_timestamp  , public.deployments.customer  , public.deployments.version  , public.deployments.db  , public.deployment_logs.timestamp as log_timestamp  , public.deployment_logs.class  , public.deployment_logs.title  , public.deployment_logs.description from public.deployments  , public.deployment_logs  where public.deployments.id=public.deployment_logs.deployment_id AND deployments.timestamp > (current_date - interval '9 days')")

    // Iterate Over ResultSet
    while (rs.next) {
      results += rs.getString("deployment_timestamp") + "," + rs.getString("customer") + "," + rs.getString("version") +  "," + rs.getString("db") +  "," + rs.getString("log_timestamp") +  "," + rs.getString("class") +  ","+ rs.getString("title") +  ","+ rs.getString("description")
    }

    conn.close
    println("Got deployment data.")
    results
  }

  def getParallellyExecTscripts(customer: String, version: String, startTime: String, endTime: String):String = {

    //var results:String = ""
    var results:String= "start_time,end_time,customer,version,project,test_suite,test_case,status\n"
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    // Configure to be Read Only
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    val rs = statement.executeQuery("select customer,version,start_time,end_time,project,test_suite,test_case,status from regression.all_data_flat where customer = '"+customer+"' and version = '"+version+"' and ((start_time >= '"+startTime+"' and end_time <= '"+endTime+"') OR (start_time <= '"+startTime+"' and end_time >= '"+endTime+"'))")

    //Iterate over ResultSet
    while(rs.next) {
      results += rs.getString("start_time") + "," + rs.getString("end_time") + "," + rs.getString("customer") +  "," + rs.getString("version")+  ","+ rs.getString("project") +  "," + rs.getString("test_suite") +  "," + rs.getString("test_case") +  "," + rs.getString("status")+ "\n"
    }
    conn.close

    results
  }

  def getMostRecentAnalyses:String = {

    //var results:String = ""
    var results:String= "id,customer,version,project,test_suite,test_case,failure_type\n"
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    // Configure to be Read Only
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    val rs = statement.executeQuery("select id, customer, version, project, test_suite, test_case, failure_type from (select public.analysis_details_flat.id as id, customer, version, project, test_suite, test_case, failure_type, rank() over (partition by customer,version, project, test_suite,test_case order by timestamp desc) as r from public.analysis_for, public.analysis_details_flat where public.analysis_for.id=public.analysis_details_flat.analysis_for_id) a where a.r=1")

    //Iterate over ResultSet
    while(rs.next) {
      results += rs.getString("id") + "," + rs.getString("customer") + "," + rs.getString("version") + "," + rs.getString("project") +  "," + rs.getString("test_suite")+  ","+ rs.getString("test_case") + "," + rs.getString("failure_type")+ "\n"
    }
    conn.close

    results
  }

  def getDataForAnalysisReport(t:AnalysisNote):String = {

    var results = ""
    val columnNamesList = t.asMap.keys.toList
    def makeCSVable(s:String) = if(s.isInstanceOf[String]) s.replace(",","<comma>").replace("\r\n","<newline>").replace("\n","<newline>").replace("\r","<newline>") else ""

    results += columnNamesList.mkString(",")+"\n"

    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    // Configure to be Read Only
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    val rs = statement.executeQuery("select * from (select *, rank() over (partition by customer, version, project, test_suite, test_case order by timestamp desc) as r from public.analysis_for, public.analysis_details_flat where public.analysis_for.id=public.analysis_details_flat.analysis_for_id and test_suite is not null and test_case is not null) x where x.r=1")

    //Iterate over ResultSet
    // Iterate Over ResultSet
    while (rs.next) {
      val columnValuesList = {
        for {
          c <- columnNamesList
        } yield makeCSVable(rs.getString(c))
      }.toList

      results += columnValuesList.mkString(",") + "\n"
    }

    conn.close

    results
  }

   def insertAnalysis(a:AnalysisNote):String = {

    /*
    ALGO
    1. Split note into (title, desc) and others(identifier)
    2. Try to get id of identifier
    3. If row exists, get id. Else add row and get id.
    4. Add analysis detail for acquired id.
     */

    println("Inserting analysis data...")
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    def optionToSQLString(opt: Option[String]): String = {
      opt match {
        case None => "''"
        case Some(x) => s"'$x' "
      }
    }
     // Configure select queries to be Read Only
    val selectStatement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)
    // Configure insert queries to be updatable
    val insertStatement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_UPDATABLE)


    //get analysis identifier; get existing if available or create new if not
    val identifierSelectQuery = s"select * from public.analysis_for where customer= ${optionToSQLString(a.customer)} AND version= ${optionToSQLString(a.version)} AND project= ${optionToSQLString(a.project)} AND test_suite= ${optionToSQLString(a.testSuite)} AND test_case= ${optionToSQLString(a.testCase)}"
     println(identifierSelectQuery)
    val identifierResult = selectStatement.executeQuery(identifierSelectQuery)
    val isAvailable = identifierResult.next()
    val identifierId = if(isAvailable) identifierResult.getString("id") else {
    val identifierInsertQuery = s"insert into public.analysis_for(customer, version, project, test_suite, test_case) values(${optionToSQLString(a.customer)} ,${optionToSQLString(a.version)}, ${optionToSQLString(a.project)}, ${optionToSQLString(a.testSuite)}, ${optionToSQLString(a.testCase)} ) RETURNING id"
    println(identifierInsertQuery)
    val insertResult = insertStatement.executeQuery(identifierInsertQuery)
            insertResult.next()
            insertResult.getString("id")
          }


    //enter analysis note for obtained id
     val columnNamesList = for {
       i <- a.asMap
       if i._2.nonEmpty
       if !AnalysisNote.analysisIdentifiers.contains(i._1)
     } yield i._1

     val columnValuesList = for {
       i <- columnNamesList
     } yield s"'${a.asMap(i).replace("'","''")}'" //replacing single quotes with two quotes, as required by SQL syntax

    val analysisNoteInsertQuery = s"insert into public.analysis_details_flat (${columnNamesList.mkString(",")},analysis_for_id) values (${columnValuesList.mkString(",")},$identifierId) RETURNING id"
    println(analysisNoteInsertQuery)
    val notesResult = insertStatement.executeQuery(analysisNoteInsertQuery)
    notesResult.next()
    val notesId = notesResult.getString("id")
    conn.close

    println("Added analysis note")
    notesId
  }

  def updateAnalysis(a:AnalysisNote, id:Int):String = {

    println("Updating analysis data...")
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"

    // Setup the connection
    val conn = DriverManager.getConnection(conn_str)

    // Configure update queries to be updatable
    val updateStatement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_UPDATABLE)

    //enter analysis note for obtained id
    val columnNamesList = for {
      i <- a.asMap
      if i._2.nonEmpty
      if !AnalysisNote.analysisIdentifiers.contains(i._1)
    } yield i._1

    val columnValuesList = for {
      i <- columnNamesList
    } yield s"'${a.asMap(i).replace("'","''")}'" //replacing single quotes with two quotes, as required by SQL syntax

    val columnsNamesAndValues = (columnNamesList zip columnValuesList).map(i=>i._1+"="+i._2).mkString(",")

    val analysisNoteUpdateQuery = s"update public.analysis_details_flat set $columnsNamesAndValues where id=$id returning id"
    println(analysisNoteUpdateQuery)
    val returnedID = if(columnNamesList.nonEmpty) {
      val rs = updateStatement.executeQuery(analysisNoteUpdateQuery)
      if (rs.next()) rs.getString("id") else "Invalid ID"
    }  else "Nothing to update"
    conn.close

    println("Updated analysis note")
    returnedID
  }


  def getAnalysis(a:AnalysisNote):String = {

    println("Getting analysis data...")
    var results = ""
    val columnNamesList = a.asMap.keys.toList

    results += "id,timestamp,"+ columnNamesList.mkString(",")+"\n"

    val queryConditions = for {
      i <- a.asMap
      if i._2.nonEmpty
    } yield i._1 + " = '" + i._2 + "'"

    def makeCSVable(s:String) = if(s.isInstanceOf[String]) s.replace(",","<comma>").replace("\r\n","<newline>").replace("\n","<newline>").replace("\r","<newline>") else ""

    val queryPart = if(queryConditions.isEmpty) "" else " AND " + queryConditions.mkString(" AND ")

    // Setup the connection
    val conn_str = "jdbc:postgresql://bxb-phat2-lnx:5432/postgres?user=postgres&password=postgres"
    val conn = DriverManager.getConnection(conn_str)

    // Configure to be Read Only
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)

    val analysisNoteSelectQuery = s"select public.analysis_details_flat.id, timestamp, ${columnNamesList.mkString(",")} from public.analysis_for,public.analysis_details_flat where public.analysis_for.id=public.analysis_details_flat.analysis_for_id $queryPart order by timestamp desc"
    println(analysisNoteSelectQuery)
    // Execute Query
    val rs = statement.executeQuery(analysisNoteSelectQuery)

    // Iterate Over ResultSet
    while (rs.next) {
      val columnValuesList = {
        for {
          c <- columnNamesList
        } yield makeCSVable(rs.getString(c))
      }.toList

      //println(s"${columnNamesList.length}, ${columnValuesList.length}")

      results += rs.getString("id") + "," + rs.getString("timestamp") + "," + columnValuesList.mkString(",")+"\n"
    }

    conn.close
    println("Got analysis data.")
    results

  }

}
