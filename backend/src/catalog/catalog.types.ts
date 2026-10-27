export interface Test{
    id : string;
    code : string;
    name : string;
    price : number;
    status : boolean;
}
export interface Package{
    id : string;
    name : string;
    price :number;
    testIds: string[];
    status: boolean;
}

export interface CatalogData{
    tests : Test[];
    packages : Package[];
}