import {json} from "../common/json";
import {Bytes} from "../common/collections";

export declare namespace StoreFilter {
    function get(key: string): Bytes;
    function set(key: string, value: Bytes): void;
    function remove(key: string): void;
}

export namespace StoreFilter {
    export function getJSON(key: string): any {
        const value = StoreFilter.get(key);
        if (value === null) {
            return null;
        }
        return json.fromBytes(value)
    }
}