declare module 'firebase-token-generator' {
  class FirebaseTokenGenerator {
    constructor(secret: string);
    createToken(data: object, opts: object): string;
  }
  export default FirebaseTokenGenerator;
}
