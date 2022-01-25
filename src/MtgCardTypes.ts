interface MtgCard {
    name: string
}

class MyCardClass implements MtgCard {
    name: string;

    constructor(name:string) {
        this.name = name
    }
}