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
/**
 * The parcel content items
 * @export
 * @interface CommodityData
 */
export interface CommodityData {
    /**
     * The commodity's weight
     * @type {number}
     * @memberof CommodityData
     */
    weight: number;
    /**
     * The commodity's weight unit
     * @type {string}
     * @memberof CommodityData
     */
    weight_unit: CommodityDataWeightUnitEnum;
    /**
     * A description of the commodity
     * @type {string}
     * @memberof CommodityData
     */
    description?: string | null;
    /**
     * The commodity's quantity (number or item)
     * @type {number}
     * @memberof CommodityData
     */
    quantity?: number;
    /**
     * The commodity's sku number
     * @type {string}
     * @memberof CommodityData
     */
    sku?: string | null;
    /**
     * The monetary value of the commodity
     * @type {number}
     * @memberof CommodityData
     */
    value_amount?: number | null;
    /**
     * The currency of the commodity value amount
     * @type {string}
     * @memberof CommodityData
     */
    value_currency?: string | null;
    /**
     * The origin or manufacture country
     * @type {string}
     * @memberof CommodityData
     */
    origin_country?: string | null;
    /**
     * The id of the related order line item.
     * @type {string}
     * @memberof CommodityData
     */
    parent_id?: string | null;
    /**
     * 
     * <details>
     * <summary>Commodity user references metadata.</summary>
     * 
     * ```
     * {
     *     "part_number": "5218487281",
     *     "reference1": "# ref 1",
     *     "reference2": "# ref 2",
     *     "reference3": "# ref 3",
     *     "reference4": "# ref 4",
     *     ...
     * }
     * ```
     * </details>
     * @type {object}
     * @memberof CommodityData
     */
    metadata?: object | null;
}

/**
* @export
* @enum {string}
*/
export enum CommodityDataWeightUnitEnum {
    Kg = 'KG',
    Lb = 'LB'
}

export function CommodityDataFromJSON(json: any): CommodityData {
    return CommodityDataFromJSONTyped(json, false);
}

export function CommodityDataFromJSONTyped(json: any, ignoreDiscriminator: boolean): CommodityData {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'weight': json['weight'],
        'weight_unit': json['weight_unit'],
        'description': !exists(json, 'description') ? undefined : json['description'],
        'quantity': !exists(json, 'quantity') ? undefined : json['quantity'],
        'sku': !exists(json, 'sku') ? undefined : json['sku'],
        'value_amount': !exists(json, 'value_amount') ? undefined : json['value_amount'],
        'value_currency': !exists(json, 'value_currency') ? undefined : json['value_currency'],
        'origin_country': !exists(json, 'origin_country') ? undefined : json['origin_country'],
        'parent_id': !exists(json, 'parent_id') ? undefined : json['parent_id'],
        'metadata': !exists(json, 'metadata') ? undefined : json['metadata'],
    };
}

export function CommodityDataToJSON(value?: CommodityData | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'weight': value.weight,
        'weight_unit': value.weight_unit,
        'description': value.description,
        'quantity': value.quantity,
        'sku': value.sku,
        'value_amount': value.value_amount,
        'value_currency': value.value_currency,
        'origin_country': value.origin_country,
        'parent_id': value.parent_id,
        'metadata': value.metadata,
    };
}

