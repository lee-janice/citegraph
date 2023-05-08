import { useEffect, useState } from "react";
import styled from "styled-components";
import {
    getCitationsBySSID,
    getPaperByDOI,
    getPaperByKeyword,
    getReferencesBySSID,
    Paper,
} from "../api/semanticScholarApi";
import { Network, IdType } from "vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data";
import { Node, Edge } from "./citeGraph";

/* https://www.w3schools.com/howto/howto_css_fixed_sidebar.asp */
const StyledSidebar = styled.div`
    height: 100%;
    width: 33%;
    padding-top: 20px;
    top: 0;
    left: 0;
    position: fixed; /* stay in place on scroll */
    z-index: 100;
    overflow-x: hidden; /* disable horizontal scroll */
    border-left: 1px solid var(--borderColor);
    background-color: var(--primaryBackgroundColor);
    text-align: left;

    @media (max-width: 1100px) {
        height: 100%;
        width: 100%;
        top: 80%;
        display: block;
        position: absolute;
        z-index: 1000;
        border-left: none;
        border-top: 1px solid var(--borderColor);
        text-align: left;
    }
`;

enum InputType {
    DOI,
    Keyword,
}

interface Props {
    visNetwork: Network | null;
    nodes: DataSet<Node>;
    edges: DataSet<Edge>;
    latestSelection: IdType;
}

const Sidebar: React.FC<Props> = ({ visNetwork, nodes, edges, latestSelection }) => {
    // const { vis, visNetwork } = React.useContext(VisContext);

    // keep track of nav bar tab state
    // const [currentNavTab, setCurrentNavTab] = useState<NavTab>(NavTab.Home);

    const [doiInput, setDoiInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [paper, setPaper] = useState<Paper | undefined>(undefined);

    const handlePaper = async (inputType: InputType) => {
        let paper: Paper;
        switch (inputType) {
            case InputType.DOI:
                paper = await getPaperByDOI(doiInput);
                break;
            case InputType.Keyword:
                paper = await getPaperByKeyword(keywordInput);
                break;
        }

        const references = (await getReferencesBySSID(paper.paperId))
            .filter((ref) => ref.citedPaper.citationCount !== null)
            .sort((a, b) => b.citedPaper.citationCount - a.citedPaper.citationCount)
            .slice(0, 8);

        const citations = (await getCitationsBySSID(paper.paperId))
            .filter((cite) => cite.citingPaper.citationCount !== null)
            .sort((a, b) => b.citingPaper.citationCount - a.citingPaper.citationCount)
            .slice(0, 3);

        setPaper(paper);

        // add nodes and edges for paper, references, and citations
        var newNodes: Node[] = [];
        var newEdges: Edge[] = [];

        var newNode = {} as Node;
        var newEdge = {} as Edge;

        // only add node if not already in the graph
        if (
            !nodes
                .get()
                .map((n) => n.id)
                .includes(paper.paperId)
        ) {
            // add queried paper to graph
            // https://stackoverflow.com/questions/31816061/why-am-i-getting-an-error-object-literal-may-only-specify-known-properties
            const queriedNode = {
                id: paper.paperId,
                paper: paper,
                label: paper.title,
                // calculate size on a log scale (so we don't get ginormous nodes, also add 5 to have 0 map to 5 and 1 map to 6, etc.)
                size: paper.citationCount === 0 ? 5 : Math.log(paper.citationCount) + 5,
                x: paper.year * 16,
                y: -paper.citationCount / 64,
            } as Node;
            newNodes.push(queriedNode);
        }

        // add references to graph
        references.forEach((ref) => {
            if (
                !nodes
                    .get()
                    .map((n) => n.id)
                    .includes(ref.citedPaper.paperId)
            ) {
                newNode = {
                    id: ref.citedPaper.paperId,
                    paper: ref.citedPaper,
                    label: ref.citedPaper.title,
                    size: ref.citedPaper.citationCount === 0 ? 5 : Math.log(ref.citedPaper.citationCount) + 5,
                    x: ref.citedPaper.year * 16,
                    y: -ref.citedPaper.citationCount / 64,
                } as Node;
                newNodes.push(newNode);
            }

            // add an edge from the reference node to the paper node
            newEdge = {
                from: ref.citedPaper.paperId,
                to: paper.paperId,
            } as Edge;
            newEdges.push(newEdge);
        });

        // add citations to graph
        citations.forEach((cite) => {
            if (
                !nodes
                    .get()
                    .map((n) => n.id)
                    .includes(cite.citingPaper.paperId)
            ) {
                newNode = {
                    id: cite.citingPaper.paperId,
                    paper: cite.citingPaper,
                    label: cite.citingPaper.title,
                    size: cite.citingPaper.citationCount === 0 ? 5 : Math.log(cite.citingPaper.citationCount) + 5,
                    x: cite.citingPaper.year * 16,
                    y: -cite.citingPaper.citationCount / 64,
                } as Node;
                newNodes.push(newNode);
            }

            // add an edge from the paper node to the citation node
            newEdge = {
                from: paper.paperId,
                to: cite.citingPaper.paperId,
            } as Edge;
            newEdges.push(newEdge);
        });

        nodes.add(newNodes);
        edges.add(newEdges);
        visNetwork?.fit();

        // select the queried paper in the graph
        visNetwork?.setSelection({ nodes: [paper.paperId as IdType] });
    };

    // update sidebar when selection is updated
    useEffect(() => {
        setPaper(nodes.get(latestSelection)?.paper);
    }, [latestSelection]);

    if (!visNetwork) {
        return <StyledSidebar className="sidebar"></StyledSidebar>;
    }

    return (
        <StyledSidebar className="sidebar">
            Search by DOI: <input type="search" onChange={(e) => setDoiInput(e.target.value)} />
            <input type="submit" value="submit" onClick={() => handlePaper(InputType.DOI)} />
            <br />
            <br />
            Search by Keyword: <input type="search" onChange={(e) => setKeywordInput(e.target.value)} />
            <input type="submit" value="submit" onClick={() => handlePaper(InputType.Keyword)} />
            <br />
            <br />
            Paper: {paper?.title}
            <br />
            <br />
            Abstract: {paper?.abstract}
            {/* <NavBar currentNavTab={currentNavTab} setCurrentNavTab={setCurrentNavTab} />
            {currentNavTab === NavTab.Home && (
                <>
                    <WikipediaSummaries
                        summaries={summaries}
                        setSummaries={setSummaries}
                        currentSummary={currentSummary}
                        setCurrentSummary={setCurrentSummary}
                    />
                    <div className="search-bar">
                        Search for a Wikipedia article:
                        <br />
                        <input type="search" placeholder="Article title" onChange={(e) => setInput(e.target.value)} />
                        <br />
                        <input type="submit" value="Create new graph" onClick={createNewGraph} />
                        <input type="submit" value="Add to graph" onClick={addToGraph} />
                    </div>
                </>
            )}
            {currentNavTab === NavTab.About && <About />}
            {currentNavTab === NavTab.UserManual && <UserManual />} */}
        </StyledSidebar>
    );
};

export default Sidebar;
