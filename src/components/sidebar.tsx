import { useState } from "react";
import styled from "styled-components";
import {
    getCitationsBySSID,
    getPaperByDOI,
    getPaperByKeyword,
    getReferencesBySSID,
    Paper,
} from "../api/semanticScholarApi";
import { OptId } from "vis-data/declarations/data-interface";
import { Network, IdType } from "vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data";

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
    nodes: DataSet<Partial<Record<"id", OptId>>, "id">;
    edges: DataSet<Partial<Record<"id", OptId>>, "id">;
}

const Sidebar: React.FC<Props> = ({ visNetwork, nodes, edges }) => {
    // const { vis, visNetwork } = React.useContext(VisContext);

    // keep track of nav bar tab state
    // const [currentNavTab, setCurrentNavTab] = useState<NavTab>(NavTab.Home);

    const [doiInput, setDoiInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [paper, setPaper] = useState<Paper | null>(null);
    const [nodeCounter, setNodeCounter] = useState(0);

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
        var newNodes: Partial<Record<"id", OptId>>[] = [];
        var newEdges: Partial<Record<"id", OptId>>[] = [];
        var count = 0;

        var newNode = {} as Partial<Record<"id", OptId>>;
        var newEdge = {} as Partial<Record<"id", OptId>>;

        // add queried paper to graph
        // https://stackoverflow.com/questions/31816061/why-am-i-getting-an-error-object-literal-may-only-specify-known-properties
        const queriedNode = {
            id: nodeCounter,
            label: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            // calculate size on a log scale (so we don't get ginormous nodes, also add 5 to have 0 map to 5 and 1 map to 6, etc.)
            size: paper.citationCount === 0 ? 5 : Math.log(paper.citationCount) + 5,
            x: paper.year * 16,
            y: -paper.citationCount / 64,
        } as Partial<Record<"id", OptId>>;
        newNodes.push(queriedNode);
        count += 1;

        // add references to graph
        references.forEach((ref) => {
            newNode = {
                id: nodeCounter + count,
                label: ref.citedPaper.title,
                authors: ref.citedPaper.authors,
                abstract: ref.citedPaper.abstract,
                size: ref.citedPaper.citationCount === 0 ? 5 : Math.log(ref.citedPaper.citationCount) + 5,
                x: ref.citedPaper.year * 16,
                y: -ref.citedPaper.citationCount / 64,
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

        // add citations to graph
        citations.forEach((cite) => {
            newNode = {
                id: nodeCounter + count,
                label: cite.citingPaper.title,
                authors: cite.citingPaper.authors,
                abstract: cite.citingPaper.abstract,
                size: cite.citingPaper.citationCount === 0 ? 5 : Math.log(cite.citingPaper.citationCount) + 5,
                x: cite.citingPaper.year * 16,
                y: -cite.citingPaper.citationCount / 64,
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

        // select the queried paper in the graph
        visNetwork?.setSelection({ nodes: [queriedNode.id as IdType] });
    };

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
