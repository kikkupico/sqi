package PHATAnalytics

//IMPORTANT: add newly added database columns to this class as parameter; the parameter variable name will become the query parameter in the API; set database column name in 'asMap' method
case class AnalysisNote(customer: Option[String], version: Option[String], project: Option[String], testSuite: Option[String], testCase: Option[String], //represent analysis_for
                        failureType: Option[String], failureReason: Option[String], reportDate: Option[String], defectID: Option[String]) {
  def prettify(o: Option[String]):String = o match {
    case Some(s) => s
    case None => ""
  }

  //IMPORTANT: map key should be the same as database column name
  def asMap:Map[String,String] = {Map("customer" -> prettify(customer), "version" -> prettify(version), "project" -> prettify(project), "test_suite" -> prettify(testSuite), "test_case" -> prettify(testCase), "failure_type" -> prettify(failureType), "failure_reason" -> prettify(failureReason), "report_date" -> prettify(reportDate), "defect_id" -> prettify(defectID))}

  //override def toString:String = prettify(customer) + "," + prettify(version) + "," + prettify(project) + "," + prettify(testSuite) + "," + prettify(testCase) + "," + prettify(title) + "," + prettify(description)
}

object AnalysisNote {
  val analysisIdentifiers = List("customer", "version", "project", "test_suite", "test_case")
}