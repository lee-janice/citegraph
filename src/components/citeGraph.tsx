import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { Network, Options } from "vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data";
import { OptId } from "vis-data/declarations/data-interface";

interface Props {
    setVisNetwork: Dispatch<SetStateAction<Network | null>>;
    setNodes: Dispatch<React.SetStateAction<DataSet<Partial<Record<"id", OptId>>, "id">>>;
    setEdges: Dispatch<React.SetStateAction<DataSet<Partial<Record<"id", OptId>>, "id">>>;
}

const CiteGraph: React.FC<Props> = ({ setVisNetwork, setNodes, setEdges }) => {
    const nodes = new DataSet([]);
    const edges = new DataSet([]);
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
                strokeWidth: 7.5,
            },
            widthConstraint: { maximum: 256 },
        },
        edges: { arrows: { to: { enabled: true } } },
        physics: false,
        interaction: { multiselect: true }, // allows for multi-select using a long press or cmd-click
        // layout: { randomSeed: 1337 },
    };

    // Create a ref to provide DOM access
    const visRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const network = visRef.current && new Network(visRef.current, { nodes: nodes, edges: edges }, options);
        setVisNetwork(network);
        setNodes(nodes);
        setEdges(edges);
    }, [visRef]);

    return <div ref={visRef} id="citegraph" />;
};

export default CiteGraph;
