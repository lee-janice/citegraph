export interface Author {
    authorId: number;
    name: string;
}

export interface Paper {
    paperId: string;
    title: string;
    authors: Author[];
    abstract: string;
    year: number;
    citationCount: number;
}

export interface Reference {
    isInfluential: boolean;
    citedPaper: Paper;
}

export interface Citation {
    isInfluential: boolean;
    citingPaper: Paper;
}

const SEMANTIC_SCHOLAR_API_HOST = "http://localhost:8080/";
// const SEMANTIC_SCHOLAR_API_HOST = process.env.REACT_APP_SEMANTIC_SCHOLAR_API_HOST;

export async function getPaperByDOI(doi: string): Promise<Paper> {
    const endpoint = `${SEMANTIC_SCHOLAR_API_HOST}api/paper/DOI:${doi}/fields=title,authors,abstract,year,citationCount`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    console.log(json);
    return json as Paper;
}

export async function getPaperBySSID(ssid: string): Promise<Paper> {
    const endpoint = `${SEMANTIC_SCHOLAR_API_HOST}api/paper/SSID:${ssid}/fields=title,authors,abstract,year,citationCount`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    console.log(json);
    return json as Paper;
}

export async function getPaperByKeyword(keyword: string): Promise<Paper> {
    const endpoint = `${SEMANTIC_SCHOLAR_API_HOST}api/paper/keyword:${keyword}/fields=title,authors,abstract,year,citationCount`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    console.log(json.data[0]);
    return json.data[0] as Paper;
}

export async function getReferencesBySSID(ssid: string): Promise<Reference[]> {
    const endpoint = `${SEMANTIC_SCHOLAR_API_HOST}api/references/SSID:${ssid}/fields=title,authors,abstract,year,citationCount,isInfluential`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    console.log(json);
    return json.data as Reference[];
}

export async function getCitationsBySSID(ssid: string): Promise<Citation[]> {
    const endpoint = `${SEMANTIC_SCHOLAR_API_HOST}api/citations/SSID:${ssid}/fields=title,authors,abstract,year,citationCount,isInfluential&limit=999`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    console.log(json);
    return json.data as Citation[];
}
