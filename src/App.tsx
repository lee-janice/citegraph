import { useState } from "react";
import { IdType, Network } from "vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data";
import VisNetwork from "./components/citeGraph";
import "./App.css";
import Sidebar from "./components/sidebar";
import { Node, Edge } from "./components/citeGraph";

function App() {
    const [visNetwork, setVisNetwork] = useState<Network | null>(null);
    const [nodes, setNodes] = useState(new DataSet<Node>({}));
    const [edges, setEdges] = useState(new DataSet<Edge>({}));
    const [latestSelection, setLatestSelection] = useState<IdType>(0);

    return (
        <div className="App">
            <Sidebar visNetwork={visNetwork} nodes={nodes} edges={edges} latestSelection={latestSelection} />
            <VisNetwork
                setVisNetwork={setVisNetwork}
                setNodes={setNodes}
                setEdges={setEdges}
                setLatestSelection={setLatestSelection}
            ></VisNetwork>
        </div>
    );
}

export default App;
