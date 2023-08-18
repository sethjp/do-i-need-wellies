export interface Pullable {
    pull(): void | Promise<void>;
}