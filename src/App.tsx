import { useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data";
import VisNetwork from "./components/citeGraph";
import "./App.css";
import Sidebar from "./components/sidebar";

function App() {
    const [visNetwork, setVisNetwork] = useState<Network | null>(null);
    const [nodes, setNodes] = useState(new DataSet({}));
    const [edges, setEdges] = useState(new DataSet({}));
    const [selection, setSelection] = useState();

    return (
        <div className="App">
            <Sidebar visNetwork={visNetwork} nodes={nodes} edges={edges} />
            <VisNetwork setVisNetwork={setVisNetwork} setNodes={setNodes} setEdges={setEdges}></VisNetwork>
        </div>
    );
}

export default App;
