import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import NeoVis from 'neovis.js/dist/neovis';

class AppCodeSearch extends Form {

    viz = null;
    config = {
        container_id: "viz",
        server_url: "bolt://localhost:7687",
        server_user: "reader",
        server_password: "neo4j",
        // console_debug: true
    }

    state = {
        data: {appcode: "", graphType: "1"},
        errors: {}
    }

    options = [
        {
            _id: 1,
            name: "Interfaces"
        },
        {
            _id: 2,
            name: "Infrastructure"
        },
    ];


    schema = {
        appcode: Joi.string().required().label("App Code"),
        graphType: Joi.number().required().label("Graph Type")
    };

    //Relationships  - REST, FILE, STORE, ENV, RUNS, PUBLISH, SUBSCRIBE
    neoConfig = {
        ...this.config,
        labels: {
            Application: {
                caption: "code",
                color: "#B3AB68FF",
                title_properties: [
                    "code",
                    "name"
                ]
            },
            Database: {
                caption: "code",
                color: "#6e84e1",
                title_properties: [
                    "code",
                    "name"
                ]
            },
            Environment: {
                caption: "env",
                color: "#8fc589",
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
                color: "#d27f66",
                title_properties: [
                    "code",
                    "name"
                ]
            },
            Messaging: {
                caption: "code",
                color: "#cc68b4",
                title_properties: [
                    "code",
                    "name"
                ]
            }
        },
        relationships: {

            ENV: {
                caption: false
            },
        },
        arrows: true
    };

    // componentDidMount() {
    //     this.draw();
    // }

    draw = () => {
        const {appcode, graphType} = this.state.data;
        const cypherQuery = "MATCH (n)<-[r]->(m:Application{code: '" + appcode.toUpperCase() + "'}) " +
            (graphType === "2" ? "where not n:Application " : "where n:Application or n:Messaging ") +
            (graphType === "2" ? "MATCH (e:Environment{application: '" + appcode.toUpperCase() + "'})<-[r1:ENV]-(n) " : "") +
            (graphType === "1" ? "OPTIONAL MATCH (a1:Application)<-[r2:SUBSCRIBE]-(n:Messaging)<-[r3:PUBLISH]-(m) " : "") +
            (graphType === "1" ? "OPTIONAL MATCH (a2:Application)-[r4:PUBLISH]->(n)-[r5:SUBSCRIBE]->(m) " : "") +
            "RETURN *";
        console.log(" cypher query - ", cypherQuery);

        let initialCypher = this.neoConfig.initial_cypher;
        if (initialCypher && initialCypher === cypherQuery) {
            this.viz.renderWithCypher(cypherQuery);
        } else {
            this.neoConfig["initial_cypher"] = cypherQuery;
            this.viz = new NeoVis(this.neoConfig);
            this.viz.render();
        }


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
                <form className="form-inline w-50 row" onSubmit={this.handleSubmit}>
                    <div className="col-5">
                        <div className="w-100">
                            {this.renderSelect("graphType", "", this.options, false)}
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="w-100">
                            {this.renderInput("appcode", "", "search", false)}
                        </div>
                    </div>
                    <div className="col-2">{this.renderButton("Search")}</div>
                </form>
            </nav>
        );
    }
}

export default AppCodeSearch;
