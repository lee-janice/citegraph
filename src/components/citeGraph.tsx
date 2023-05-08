import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { IdType, Network, Options } from "vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data";
import { Paper } from "../api/semanticScholarApi";

interface Props {
    setVisNetwork: Dispatch<SetStateAction<Network | null>>;
    setNodes: Dispatch<React.SetStateAction<DataSet<Node>>>;
    setEdges: Dispatch<React.SetStateAction<DataSet<Edge>>>;
    setLatestSelection: Dispatch<React.SetStateAction<IdType>>;
}

export interface Node {
    id: IdType;
    paper: Paper;
    size: number;
    x: number;
    y: number;
}

export interface Edge {
    id: IdType;
    from: IdType;
    to: IdType;
}

const CiteGraph: React.FC<Props> = ({ setVisNetwork, setNodes, setEdges, setLatestSelection }) => {
    const nodes = new DataSet([]);
    const edges = new DataSet([]);

    // https://visjs.github.io/vis-network/docs/network/#options
    const options: Options = {
        nodes: {
            shape: "dot",
            borderWidth: 1.5,
            color: {
                background: "lightgray",
                border: "gray",
                highlight: {
                    border: "#a42a04",
                    background: "lightgray",
                },
            },
            font: {
                size: 11,
                strokeWidth: 5,
            },
            widthConstraint: { maximum: 256 },
        },
        edges: { arrows: { to: { enabled: true } } },
        physics: false,
        interaction: { multiselect: true }, // allows for multi-select using a long press or cmd-click
    };

    // create a ref to provide DOM access
    const visRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const network = visRef.current && new Network(visRef.current, { nodes: nodes, edges: edges }, options);
        setVisNetwork(network);
        setNodes(nodes);
        setEdges(edges);

        // register event listeners
        // update latest selection when user clicks a node
        network?.on("click", (click) => {
            if (click.nodes.length > 0) {
                setLatestSelection(click.nodes[0]);
            }
        });
    }, [visRef]);

    return <div ref={visRef} id="citegraph" />;
};

export default CiteGraph;
