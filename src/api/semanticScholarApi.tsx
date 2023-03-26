interface Author {
    authorId: number;
    name: string;
}

interface Paper {
    paperId: string;
    title: string;
    authors: Author[];
    abstract: string;
    year: number;
    citationCount: number;
}

interface Reference {
    isInfluential: boolean;
    citedPaper: Paper;
}

interface Citation {
    isInfluential: boolean;
    citingPaper: Paper;
}

export async function getPaperByDOI(doi: string): Promise<Paper> {
    const endpoint = `http://localhost:8080/api/paper/DOI:${doi}/fields=title,authors,abstract,year,citationCount`;

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
    const endpoint = `http://localhost:8080/api/paper/SSID:${ssid}/fields=title,authors,abstract,year,citationCount`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    console.log(json);
    return json as Paper;
}

export async function getReferencesBySSID(ssid: string): Promise<Reference[]> {
    const endpoint = `http://localhost:8080/api/references/SSID:${ssid}/fields=title,authors,abstract,year,citationCount,isInfluential`;

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
    const endpoint = `http://localhost:8080/api/citations/SSID:${ssid}/fields=title,authors,abstract,year,citationCount,isInfluential`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    console.log(json);
    return json.data as Citation[];
}
