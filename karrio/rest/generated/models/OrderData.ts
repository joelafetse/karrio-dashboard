/* tslint:disable */
/* eslint-disable */
/**
 * Karrio API
 *  ## API Reference  Karrio is an open source multi-carrier shipping API that simplifies the integration of logistic carrier services.  The Karrio API is organized around REST. Our API has predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.  The Karrio API differs for every account as we release new versions. These docs are customized to your version of the API.   ## Versioning  When backwards-incompatible changes are made to the API, a new, dated version is released. The current version is `2022.3.5`.  Read our API changelog and to learn more about backwards compatibility.  As a precaution, use API versioning to check a new API version before committing to an upgrade.   ## Pagination  All top-level API resources have support for bulk fetches via \"list\" API methods. For instance, you can list addresses, list shipments, and list trackers. These list API methods share a common structure, taking at least these two parameters: limit, and offset.  Karrio utilizes offset-based pagination via the offset and limit parameters. Both parameters take a number as value (see below) and return objects in reverse chronological order. The offset parameter returns objects listed after an index. The limit parameter take a limit on the number of objects to be returned from 1 to 100.   ```json {     \"count\": 100,     \"next\": \"/v1/shipments?limit=25&offset=50\",     \"previous\": \"/v1/shipments?limit=25&offset=25\",     \"results\": [         { ... },     ] } ```  ## Environments  The Karrio API offer the possibility to create and retrieve certain objects in `test_mode`. In development, it is therefore possible to add carrier connections, get live rates, buy labels, create trackers and schedule pickups in `test_mode`.  
 *
 * The version of the OpenAPI document: 2022.3.5
 * Contact: 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    AddressData,
    AddressDataFromJSON,
    AddressDataFromJSONTyped,
    AddressDataToJSON,
} from './AddressData';
import {
    CommodityData,
    CommodityDataFromJSON,
    CommodityDataFromJSONTyped,
    CommodityDataToJSON,
} from './CommodityData';

/**
 * 
 * @export
 * @interface OrderData
 */
export interface OrderData {
    /**
     * The source' order id.
     * @type {string}
     * @memberof OrderData
     */
    order_id: string;
    /**
     * The order date. format: `YYYY-MM-DD`
     * @type {string}
     * @memberof OrderData
     */
    order_date?: string | null;
    /**
     * 
     * The order's source.
     * 
     * e.g. API, POS, ERP, Shopify, Woocommerce, etc.
     * @type {string}
     * @memberof OrderData
     */
    source?: string;
    /**
     * 
     * @type {AddressData}
     * @memberof OrderData
     */
    shipping_to: AddressData;
    /**
     * 
     * @type {AddressData}
     * @memberof OrderData
     */
    shipping_from?: AddressData;
    /**
     * The order line items.
     * @type {Array<CommodityData>}
     * @memberof OrderData
     */
    line_items: Array<CommodityData>;
    /**
     * 
     * <details>
     * <summary>The options available for the order shipments.</summary>
     * 
     * ```
     * {
     *     "currency": "USD",
     * }
     * ```
     * 
     * Please check the docs for shipment specific options.
     * </details>
     * @type {object}
     * @memberof OrderData
     */
    options?: object | null;
    /**
     * User metadata for the order.
     * @type {object}
     * @memberof OrderData
     */
    metadata?: object;
}

export function OrderDataFromJSON(json: any): OrderData {
    return OrderDataFromJSONTyped(json, false);
}

export function OrderDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): OrderData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'order_id': json['order_id'],
        'order_date': !exists(json, 'order_date') ? undefined : json['order_date'],
        'source': !exists(json, 'source') ? undefined : json['source'],
        'shipping_to': AddressDataFromJSON(json['shipping_to']),
        'shipping_from': !exists(json, 'shipping_from') ? undefined : AddressDataFromJSON(json['shipping_from']),
        'line_items': ((json['line_items'] as Array<any>).map(CommodityDataFromJSON)),
        'options': !exists(json, 'options') ? undefined : json['options'],
        'metadata': !exists(json, 'metadata') ? undefined : json['metadata'],
    };
}

export function OrderDataToJSON(value?: OrderData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'order_id': value.order_id,
        'order_date': value.order_date,
        'source': value.source,
        'shipping_to': AddressDataToJSON(value.shipping_to),
        'shipping_from': AddressDataToJSON(value.shipping_from),
        'line_items': ((value.line_items as Array<any>).map(CommodityDataToJSON)),
        'options': value.options,
        'metadata': value.metadata,
    };
}

