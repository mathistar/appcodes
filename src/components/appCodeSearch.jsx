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
    data: { appcode: "GCIN"},
    errors: {}
  };

  schema = {
    appcode: Joi.string()
      .required()
      .label("App Code")
  };

  draw = () => {
    const { appcode } = this.state.data;
    const NEOVIS_DEFAULT_CONFIG = Symbol();
    const cypherQuery = "MATCH (n)<-[r]->(m{code: '"+ appcode.toUpperCase() +"'}) RETURN *";
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
        }
      },
      relationships: {
        REST_API: {
          thickness: "0.5",
          caption: true
        },
        KAFKA: {
          thickness: "0.5",
          caption: true
        },
        ADA: {
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
