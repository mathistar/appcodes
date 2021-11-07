
MATCH (n:Application) DETACH DELETE n
MATCH (n:Database) DETACH DELETE n
MATCH (n:Platform) DETACH DELETE n
MATCH (n:Environment) DETACH DELETE n
match (m:Messaging) DETACH DELETE m


LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-codes.csv' as row
MERGE (src:Application {code: row.code, name: row.name})
WITH row, src
  WHERE row.tech IS NOT NULL
MERGE (ch:Application {code: row.code}) SET ch.tech = row.tech
RETURN src



LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-interface.csv' as row
MATCH (src:Application {code: row.source })
MATCH (target:Application {code: row.target })
FOREACH(x IN CASE WHEN toUpper(row.interface) = 'REST' THEN [1] END |
  MERGE (src)-[:REST]->(target)
)
FOREACH(x IN CASE WHEN toUpper(row.interface) = 'FILE' THEN [1] END |
  MERGE (src)-[:FILE]->(target)
)
RETURN src,target


LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-database.csv' as row
MATCH (app:Application {code: row.application})
MERGE (app)-[:STORES]->(db:Database {code: row.code, name: row.name, application: row.application})
RETURN *

LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-databaseenv.csv' as row
MATCH ((db:Database {code: row.code, application: row.application}))
MERGE (db)-[:ENV]->(env:Environment {env: row.env, code: row.code, application: row.application})
SET env.cpu = row.cpu, env.instance = row.instance, env.memory = row.memory, env.cost = row.cost
RETURN *

LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-platform.csv' as row
MATCH (app:Application {code: row.application})
MERGE (app)-[:RUNS]->(db:Platform {code: row.code, name: row.name, application: row.application})
RETURN *

LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-platformenv.csv' as row
MATCH (db:Platform {code: row.code, application: row.application})
MERGE (db)-[:ENV]->(env:Environment {env: row.env, code: row.code, application: row.application})
SET env.cpu = row.cpu, env.memory = row.memory, env.cost = row.cost
RETURN *


LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-messaging-publish.csv' as row
MATCH (app:Application {code: row.application})
MERGE (app)-[p:PUBLISH]->(db:Messaging {code: row.code, name: row.name, application: row.application})
  ON CREATE SET p.topics = [row.topic] ON MATCH SET p.topics = p.topics + [row.topic]
RETURN *

LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-messaging-subscribe.csv' as row
MATCH (msg:Messaging {code: row.code})<-[p:PUBLISH]-(:Application) where row.topic in p.topics
MATCH (app:Application {code: row.application})
MERGE  (app)<-[s:SUBSCRIBE]-(msg)
  ON CREATE SET s.topics = [row.topic] ON MATCH SET s.topics = s.topics + [row.topic]
RETURN *

LOAD CSV WITH HEADERS FROM 'http://localhost:3000/application-messagingenv.csv' as row
MATCH (db:Messaging {code: row.code, application: row.application})
MERGE (db)-[:ENV]->(env:Environment {env: row.env, code: row.code, application: row.application})
SET env.space = row.space
RETURN *


MATCH (n)<-[r]->(m:Application{code: 'GCIN'})
OPTIONAL MATCH (e:Environment{application: 'GCIN'})<-[r1:ENV]-(n)
OPTIONAL MATCH (a1:Application)<-[r2:SUBSCRIBE]-(n:Messaging)<-[r3:PUBLISH]-(m)
OPTIONAL MATCH (a2:Application)-[r4:PUBLISH]->(n)-[r5:SUBSCRIBE]->(m)
RETURN *


