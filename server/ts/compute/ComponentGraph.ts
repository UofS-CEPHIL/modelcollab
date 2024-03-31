

/**
   Just an undirected graph implementation using adjacency list
*/
export default class Graph {

    private adjacencyList: { [id: string]: string[] };

    public constructor() {
        this.adjacencyList = {};
    }

    public getNodeIds(): string[] {
        return Object.keys(this.adjacencyList);
    }

    public addNode(id: string): void {
        if (Object.keys(this.adjacencyList).includes(id)) {
            throw new Error(`Node ${id} already present in node list ${this.getNodeIds()}`)
        }
        else {
            this.adjacencyList[id] = [];
        }
    }

    public addEdge(node1: string, node2: string): void {
        const nodeIds = this.getNodeIds();
        const node1Found = nodeIds.includes(node1);
        const node2Found = nodeIds.includes(node2);
        if (!node1Found) {
            throw new Error(`Node ${node1} not found in list ${this.getNodeIds()}`);
        }
        if (!node2Found) {
            throw new Error(`Node ${node2} not found in list ${this.getNodeIds()}`);
        }

        this.adjacencyList[node1].push(node2);
        this.adjacencyList[node2].push(node1);
    }

    public getNodesAdjacentTo(id: string): string[] {
        if (!Object.keys(this.adjacencyList).includes(id)) {
            throw new Error(`Id ${id} not found in list ${this.getNodeIds()}`);
        }

        return this.adjacencyList[id];
    }
}
