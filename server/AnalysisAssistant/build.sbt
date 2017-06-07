name := "AnalysisAssistant"

version := "1.0"

scalaVersion := "2.11.8"

libraryDependencies ++= Seq(
  "com.github.finagle" %% "finch-core" % "0.11.0"
)

libraryDependencies += "com.github.pathikrit" %% "better-files" % "2.16.0"

libraryDependencies += "postgresql" % "postgresql" % "9.1-901.jdbc4"

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", xs @ _*) => MergeStrategy.discard
  case x => MergeStrategy.first
}

mainClass in (Compile, run) := Some("prog.Main")
