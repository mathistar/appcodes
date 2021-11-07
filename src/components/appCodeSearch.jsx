import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import NeoVis from 'neovis.js/dist/neovis.js';
import Neovis from "neovis.js";

class AppCodeSearch extends Form {

  config = {
    container_id: "viz",
    server_url: "bolt://localhost:7687",
    server_user: "reader",
    server_password: "neo4j"
  }

  state = {
    data: { appcode: ""},
    errors: {}
  };

  schema = {
    appcode: Joi.string()
      .required()
      .label("App Code")
  };

  draw = () => {
    const { appcode } = this.state.data;
    const cypherQuery = "MATCH (n)<-[r]->(m:Application{code: '"+ appcode.toUpperCase() +"'}) " +
      "OPTIONAL MATCH (e:Environment{application: '"+ appcode.toUpperCase() +"'})<-[r1:ENV]-(n) " +
      "OPTIONAL MATCH (a1:Application)<-[r2:SUBSCRIBE]-(n:Messaging)<-[r3:PUBLISH]-(m) " +
      "OPTIONAL MATCH (a2:Application)-[r4:PUBLISH]->(n)-[r5:SUBSCRIBE]->(m) " +
      "RETURN *";
    console.log (" cypher query - ", cypherQuery);
    const neoConfig = {
      ...this.config,
      labels: {
        Application: {
          caption: "code",
          font: {
            size: 12,
            color: "blue"
          },
          title_properties: [
            "code",
            "name"
          ]
        },
        Database: {
          caption: "code",
          font: {
            size: 12,
            color: "blue"
          },
          title_properties: [
            "code",
            "name"
          ]
        },
        Environment: {
          caption: "env",
          font: {
            size: 12,
            color: "blue"
          },
          title_properties: [
            "env",
            "cpu",
            "instance",
            "memory",
            "cost",
            "space"
          ]
        },
        Platform: {
          caption: "code",
          font: {
            size: 12,
            color: "blue"
          },
          title_properties: [
            "code",
            "name"
          ]
        },
        Messaging: {
          caption: "code",
          font: {
            size: 12,
            color: "blue"
          },
          title_properties: [
            "code",
            "name"
          ]
        }
      },
      relationships: {
        REST: {
          thickness: "0.5",
          caption: true
        },
        FILE: {
          thickness: "0.5",
          caption: true
        },
        STORES: {
          thickness: "0.5",
          caption: true
        },
        ENV: {
          thickness: "0.5",
          caption: false
        },
        RUNS: {
          thickness: "0.5",
          caption: true
        },
        PUBLISH: {
          thickness: "0.5",
          caption: true
        },
        SUBSCRIBE: {
          thickness: "0.5",
          caption: true
        }
      },
      initial_cypher: cypherQuery,
      arrows: true
    };


    const viz = new NeoVis(neoConfig);
    viz.render();
  }


  doSubmit = () => {
    // Call the server
    this.draw();
    console.log("Submitted");
  };

  render() {
    return (
      <nav className="navbar navbar-dark bg-primary justify-content-between">
        <span className="navbar-brand">Core Banking Application</span>
        <form className="form-inline w-25" onSubmit={this.handleSubmit} >
          <div className="w-100">
          {this.renderInput("appcode", "", "search", false)}
          </div>
          {/*{this.renderButton("Search")}*/}
        </form>
      </nav>
    );
  }
}

export default AppCodeSearch;
