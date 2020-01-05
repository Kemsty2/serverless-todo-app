export interface JwtKey {
    kid: string,
    nbf: string, 
    publicKey?: string,
    rsaPublicKey?: string
}