
export class DCDTToken {
    token: string = '';
    name: string = '';
    type: string = '';
    owner: string = '';
    minted: string = '';
    burnt: string = '';
    decimals: number = 18;
    isPaused: boolean = false;
    canUpgrade: boolean = false;
    canMint: boolean = false;
    canBurn: boolean = false;
    canChangeOwner: boolean = false;
    canPause: boolean = false;
    canFreeze: boolean = false;
    canWipe: boolean = false;

    constructor(init?: Partial<DCDTToken>) {
        Object.assign(this, init);
    }

    static fromHttpResponse(response: {
        token: string,
        name: string,
        type: string,
        owner: string,
        minted: string,
        burnt: string,
        decimals: number,
        isPaused: boolean,
        canUpgrade: boolean,
        canMint: boolean,
        canBurn: boolean,
        canChangeOwner: boolean,
        canPause: boolean,
        canFreeze: boolean,
        canWipe: boolean
    }) {
        let dcdtToken = new DCDTToken(response);
        return dcdtToken
    }

    getTokenName() {
        return this.name;
    }

    getTokenIdentifier() {
        return this.token;
    }

}
