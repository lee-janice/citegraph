import React, { useState } from "react";
import { Network } from "vis-network";
import { getCitationsBySSID, getPaperByDOI, getPaperByKeyword, getReferencesBySSID } from "./api/semanticScholarApi";
import { DataSet } from "vis-data/peer/esm/vis-data";
import VisNetwork from "./components/citeGraph";
import "./App.css";
import { OptId } from "vis-data/declarations/data-interface";

enum InputType {
    DOI,
    Keyword,
}

function App() {
    const [doiInput, setDoiInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [paper, setPaper] = useState("");
    const [references, setReferences] = useState("");
    const [citations, setCitations] = useState("");

    const [visNetwork, setVisNetwork] = useState<Network | null>(null);
    const [nodes, setNodes] = useState(new DataSet({}));
    const [edges, setEdges] = useState(new DataSet({}));

    const [nodeCounter, setNodeCounter] = useState(0);

    const handlePaper = async (inputType: InputType) => {
        let paper;
        switch (inputType) {
            case InputType.DOI:
                paper = await getPaperByDOI(doiInput);
                break;
            case InputType.Keyword:
                paper = await getPaperByKeyword(keywordInput);
                console.log(keywordInput);
                break;
        }
        console.log(paper);
        const references = (await getReferencesBySSID(paper.paperId)).filter((ref) => ref.isInfluential);
        const citations = (await getCitationsBySSID(paper.paperId)).filter((cite) => cite.isInfluential);

        setPaper(paper.title.toString());
        setReferences(references.map((ref) => ref.citedPaper.title).toString());
        setCitations(citations.map((cite) => cite.citingPaper.title).toString());

        // add nodes and edges for paper, references, and citations
        var newNodes: Partial<Record<"id", OptId>>[] = [];
        var newEdges: Partial<Record<"id", OptId>>[] = [];
        var count = 0;

        // https://stackoverflow.com/questions/31816061/why-am-i-getting-an-error-object-literal-may-only-specify-known-properties
        var newNode = {
            id: nodeCounter,
            label: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            // calculate size on a log scale (so we don't get ginormous nodes, +5 to have 0 map to 5 and 1 map to 6)
            size: paper.citationCount === 0 ? 5 : Math.log(paper.citationCount) + 5,
            x: (paper.year - 1900) * 25,
            y: -paper.citationCount / 10,
        } as Partial<Record<"id", OptId>>;
        newNodes.push(newNode);
        count += 1;

        var newEdge = {} as Partial<Record<"id", OptId>>;

        references.forEach((ref) => {
            newNode = {
                id: nodeCounter + count,
                label: ref.citedPaper.title,
                authors: ref.citedPaper.authors,
                abstract: ref.citedPaper.abstract,
                size: ref.citedPaper.citationCount === 0 ? 5 : Math.log(ref.citedPaper.citationCount) + 5,
                x: (ref.citedPaper.year - 1900) * 25,
                y: -ref.citedPaper.citationCount / 25,
            } as Partial<Record<"id", OptId>>;
            newNodes.push(newNode);

            // add an edge from the reference node to the paper node
            newEdge = {
                from: nodeCounter + count,
                to: nodeCounter,
            } as Partial<Record<"id", OptId>>;
            newEdges.push(newEdge);

            count += 1;
        });

        console.log(newNodes);

        citations.forEach((cite) => {
            newNode = {
                id: nodeCounter + count,
                label: cite.citingPaper.title,
                authors: cite.citingPaper.authors,
                abstract: cite.citingPaper.abstract,
                size: cite.citingPaper.citationCount === 0 ? 5 : Math.log(cite.citingPaper.citationCount) + 5,
                x: (cite.citingPaper.year - 1900) * 25,
                y: -cite.citingPaper.citationCount / 25,
            } as Partial<Record<"id", OptId>>;
            newNodes.push(newNode);

            // add an edge from the paper node to the citation node
            newEdge = {
                from: nodeCounter,
                to: nodeCounter + count,
            } as Partial<Record<"id", OptId>>;
            newEdges.push(newEdge);

            count += 1;
        });

        nodes.add(newNodes);
        edges.add(newEdges);
        visNetwork?.fit();
        setNodeCounter(nodeCounter + count);
    };

    return (
        <div className="App">
            Search by DOI: <input type="search" onChange={(e) => setDoiInput(e.target.value)} />
            <input type="submit" value="submit" onClick={() => handlePaper(InputType.DOI)} />
            <br />
            <br />
            Search by Keyword: <input type="search" onChange={(e) => setKeywordInput(e.target.value)} />
            <input type="submit" value="submit" onClick={() => handlePaper(InputType.Keyword)} />
            <br />
            <br />
            Paper: {paper}
            <br />
            <br />
            {/* References: {references}
            <br />
            <br />
            Citations: {citations}
            <br />
            <br /> */}
            <VisNetwork setVisNetwork={setVisNetwork} setNodes={setNodes} setEdges={setEdges}></VisNetwork>
        </div>
    );
}

export default App;
