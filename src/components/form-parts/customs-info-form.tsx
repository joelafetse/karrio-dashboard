import { Commodity, CommodityWeightUnitEnum, Customs, CustomsContentTypeEnum, CustomsIncotermEnum, Payment, PaymentCurrencyEnum, PaymentPaidByEnum, Shipment } from '@/purplship/rest/index';
import React, { ChangeEvent, FormEvent, useContext, useReducer, useRef, useState } from 'react';
import InputField from '@/components/generic/input-field';
import TextAreaField from '@/components/generic/textarea-field';
import CheckBoxField from '@/components/generic/checkbox-field';
import ButtonField from '@/components/generic/button-field';
import SelectField from '@/components/generic/select-field';
import { deepEqual, formatRef, isNone } from '@/lib/helper';
import { Collection, CommodityType, CURRENCY_OPTIONS, NotificationType, PAYOR_OPTIONS } from '@/lib/types';
import { UserData } from '@/context/user-provider';
import { APIReference } from '@/context/references-provider';
import { ShipmentMutationContext } from '@/context/shipment-mutation';
import { Notify } from '@/components/notifier';
import CommodityDescription from '@/components/descriptions/commodity-description';
import CommodityForm from '@/components/form-parts/commodity-form';
import { DefaultTemplatesData } from '@/context/default-templates-provider';
import { Loading } from '@/components/loader';


export const DEFAULT_CUSTOMS_CONTENT: Customs = {
  duty: undefined,
  certify: true,
  commodities: [],
  incoterm: CustomsIncotermEnum.Ddu,
  content_type: CustomsContentTypeEnum.Merchandise,
  options: {}
};
const DEFAULT_DUTY: Payment = {
  paid_by: PaymentPaidByEnum.Recipient,
  currency: PaymentCurrencyEnum.Usd
};

interface CustomsInfoFormComponent {
  value?: Customs;
  shipment?: Shipment;
  cannotOptOut?: boolean;
  update: (data: { changes?: Partial<Shipment>, refresh?: boolean }) => void;
  commodityDiscarded?: (id: string) => void
}

const CustomsInfoForm: React.FC<CustomsInfoFormComponent> = ({ children, value, shipment, cannotOptOut, update, commodityDiscarded }) => {
  const form = useRef<any>(null);
  const { notify } = useContext(Notify);
  const { loading, setLoading } = useContext(Loading);
  const { updateCustoms, discardCustoms, addCustoms, discardCommodity } = useContext(ShipmentMutationContext);
  const { default_customs } = useContext(DefaultTemplatesData);
  const { incoterms, customs_content_type } = useContext(APIReference);
  const [editCommodity, setEditCommodity] = useState<boolean>(false);
  const [commodity, setCommodity] = useState<CommodityType>();
  const [customs, dispatch] = useReducer((state: any, { name, value }: { name: string, value: string | boolean | object }) => {
    switch (name) {
      case 'hasDuty':
        return { ...state, duty: value === true ? DEFAULT_DUTY : null };
      case 'optOut':
        return value === true ? null : { ...(default_customs || DEFAULT_CUSTOMS_CONTENT) as Customs };
      case 'full':
        return { ...(value as object) };
      case 'commercial_invoice':
        return value === true ?
          { ...state, [name]: value } :
          { ...state, [name]: value, invoice: null, invoice_date: null };
      default:
        return { ...state, [name]: value };
    }
  }, value, () => value);
  const [optionsExpanded, setOptionsExpanded] = useState<boolean>(false);
  const [commoditiesExpanded, setCommoditiesExpanded] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<any> & CustomEvent<{ name: keyof Customs, value: object }>) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    dispatch({ name, value });
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (customs.id === undefined && shipment?.id !== undefined) {
        setLoading(true);
        await addCustoms(shipment.id, customs);
        update({ refresh: true });
        notify({ type: NotificationType.success, message: 'Customs Declaration successfully added!' });
      } else if (customs.id !== undefined) {
        setLoading(true);
        await updateCustoms(customs);
        update({ refresh: true });
        notify({ type: NotificationType.success, message: 'Customs Declaration successfully updated!' });
      }
      else {
        update({ changes: { customs } });
        form.current?.dispatchEvent(
          new CustomEvent('label-select-tab', { bubbles: true, detail: { nextTab: 'options' } })
        );
      }
    } catch (err: any) {
      notify({ type: NotificationType.error, message: err });
    }
    setLoading(false);
  };
  const applyOptOut = async (e: ChangeEvent<any>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isNone(shipment?.id) && !isNone(shipment?.customs?.id)) {
        await discardCustoms(shipment?.customs?.id as string);
        notify({ type: NotificationType.success, message: 'Customs declaration discarded successfully!' });
      } else {
        update({ changes: { customs: undefined } });
      }
    } catch (err: any) {
      notify({ type: NotificationType.error, message: err });
    }
    setLoading(false);
  };
  const removeCommodity = async (id: string) => {
    const commodities = (customs.commodities || []).filter((c: CommodityType) => c.id !== id);
    dispatch({ name: 'commodities', value: commodities });
    if (!id.includes('new-')) {
      if (!isNone(customs.id)) discardCommodity(customs.id, id);
      else commodityDiscarded && commodityDiscarded(id);
    }
  };
  const toggleCommodity = (commodity?: CommodityType) => {
    setCommodity({ ...(commodity || { id: `new-${Date.now()}`, weight_unit: CommodityWeightUnitEnum.Kg, quantity: 1 }) } as any);
    setEditCommodity(!editCommodity);
  };
  const refreshCommodities = async (commodity: CommodityType) => {
    const commodities = (customs.commodities || []).filter((c: CommodityType) => c.id !== commodity.id);
    dispatch({ name: 'commodities', value: [...commodities, commodity] });
    if (!isNone(customs.id)) {
      await updateCustoms({ id: customs.id, commodities: [commodity as Commodity] });
      notify({ type: NotificationType.success, message: 'Customs Commodity successfully updated!' });
    }
    toggleCommodity();
  };

  return (
    <>
      {!cannotOptOut && <div className="columns is-multiline">
        <CheckBoxField defaultChecked={isNone(customs)} onChange={handleChange} name="optOut" fieldClass="column mb-0 is-12 px-3 py-3 has-text-weight-semibold">
          <span>Opt out of customs</span>
        </CheckBoxField>
      </div>}

      {isNone(customs) && <div>
        <ButtonField className="is-primary" fieldClass="has-text-centered mt-3" onClick={applyOptOut} disabled={isNone(value)}>
          <span>Save</span>
          <span className="icon is-small">
            <i className="fas fa-chevron-right"></i>
          </span>
        </ButtonField>
      </div>}

      {!isNone(customs) && <form className="pl-1 pr-2 py-2" onSubmit={handleSubmit} ref={form} style={{ display: `${!editCommodity ? 'block' : 'none'}` }}>

        {React.Children.map(children, (child: any) => React.cloneElement(child, { ...child.props, customs, onChange: handleChange }))}

        {/* Customs Info */}
        <div className="columns is-multiline mb-0 mt-4">

          <SelectField label="Content type" value={customs?.content_type} onChange={handleChange} name="content_type" className="is-fullwidth" fieldClass="column mb-0 is-6 px-2 py-1" required >
            {customs_content_type && Object
              .entries(customs_content_type as Collection)
              .map(([code, name]) => (
                <option key={code} value={code}>{formatRef(name)}</option>
              ))
            }
          </SelectField>

          <SelectField label="incoterm" value={customs?.incoterm} onChange={handleChange} name="incoterm" className="is-fullwidth" fieldClass="column mb-0 is-6 px-2 py-1" required >
            {incoterms && Object
              .entries(incoterms as Collection)
              .map(([code, name]) => (
                <option key={code} value={code}>{`${code} (${name})`}</option>
              ))
            }
          </SelectField>

        </div>

        {/* Commercial Invoice */}
        <div className="columns is-multiline mb-0 pt-4">

          <CheckBoxField name="commercial_invoice" defaultChecked={customs?.commercial_invoice} onChange={handleChange} fieldClass="column mb-0 is-12 px-2 py-2">
            <span>Commercial Invoice</span>
          </CheckBoxField>

          <div className="columns column is-multiline mb-0 ml-6 my-1 px-2 py-0" style={{ borderLeft: "solid 2px #ddd", display: `${customs?.commercial_invoice ? 'block' : 'none'}` }}>

            <InputField label="invoice number" value={customs?.invoice} onChange={handleChange} name="invoice" className="is-small is-fullwidth" fieldClass="column mb-0 is-5 px-2 py-1" />

            <InputField label="invoice date" value={customs?.invoice_date} onChange={handleChange} name="invoice_date" type="date" className="is-small is-fullwidth" fieldClass="column mb-0 is-5 px-2 py-1" />

          </div>

        </div>

        {/* Duties */}
        <div className="columns is-multiline mb-0 pt-4">

          <CheckBoxField defaultChecked={!isNone(customs?.duty)} onChange={handleChange} name="hasDuty" fieldClass="column mb-0 is-12 px-2 py-2">
            <span>Duties</span>
          </CheckBoxField>

          <div className="columns column is-multiline mb-0 ml-6 my-1 px-2 py-0" style={{ borderLeft: "solid 2px #ddd", display: `${!isNone(customs?.duty) ? 'block' : 'none'}` }}>

            <SelectField label="paid by" value={customs?.duty?.paid_by} name="paid_by" className="is-small is-fullwidth" fieldClass="column is-5 mb-0 px-1 py-2" required={!isNone(customs?.duty)}
              onChange={e => dispatch({ name: 'duty', value: { ...customs.duty, paid_by: e.target.value, account_number: (e.target.value == PaymentPaidByEnum.ThirdParty) ? customs?.duty?.account_number : undefined } })}>
              {PAYOR_OPTIONS.map(unit => <option key={unit} value={unit}>{formatRef(unit)}</option>)}
            </SelectField>

            {customs?.duty?.paid_by === PaymentPaidByEnum.ThirdParty &&
              <InputField label="account number" value={customs?.duty?.account_number} name="account_number" className="is-small" fieldClass="column mb-0 is-5 px-1 py-2"
                onChange={e => dispatch({ name: 'duty', value: { ...customs.duty, account_number: e.target.value } })} />}

            <SelectField label="prefered currency" name="currency" className="is-small is-fullwidth" fieldClass="column is-5 mb-0 px-1 py-2"
              onChange={e => dispatch({ name: 'duty', value: { ...customs.duty, currency: e.target.value } })} value={customs?.duty?.currency}>
              {CURRENCY_OPTIONS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
            </SelectField>

            <InputField label="Declared value" name="declared_value" type="number" min={0} step="any" className="is-small" fieldClass="column mb-0 is-5 px-1 py-2"
              onChange={e => dispatch({ name: 'duty', value: { ...customs.duty, declared_value: e.target.value } })} value={customs?.duty?.declared_value} />

          </div>

        </div>

        {/* Customs Options */}
        <div className="columns p-2 my-2">
          <article className="panel is-white is-shadowless column is-12 p-0" style={{ border: "1px #ddd solid" }}>
            <p className="panel-heading select is-fullwidth px-2 pt-3" onClick={() => setOptionsExpanded(!optionsExpanded)}>
              <span className="is-size-6">Customs Identifications</span>
            </p>

            <div className="columns column is-multiline mb-0 ml-6 my-2 px-2 py-2" style={{ borderLeft: "solid 2px #ddd", display: `${optionsExpanded ? 'block' : 'none'}` }}>

              <InputField label="AES" value={customs?.options?.aes} name="aes" fieldClass="column mb-0 is-5 px-2 py-1"
                onChange={e => dispatch({ name: 'options', value: { ...(customs.options || {}), aes: e.target.value } })} />

              <InputField label="EEL / PFC" value={customs?.options?.eel_pfc} name="eel_pfc" fieldClass="column mb-0 is-5 px-2 py-1"
                onChange={e => dispatch({ name: 'options', value: { ...(customs.options || {}), eel_pfc: e.target.value } })} />

              <InputField label="certificate number" value={customs?.options?.certificate_number} name="certificate_number" fieldClass="column mb-0 is-5 px-2 py-1"
                onChange={e => dispatch({ name: 'options', value: { ...(customs.options || {}), certificate_number: e.target.value } })} />

              <InputField label="license number" value={customs?.options?.license_number} name="license_number" fieldClass="column mb-0 is-5 px-2 py-1"
                onChange={e => dispatch({ name: 'options', value: { ...(customs.options || {}), license_number: e.target.value } })} />

              <InputField label="VAT registration number" value={customs?.options?.vat_registration_number} name="vat_registration_number" fieldClass="column mb-0 is-5 px-2 py-1"
                onChange={e => dispatch({ name: 'options', value: { ...(customs.options || {}), vat_registration_number: e.target.value } })} />

              <InputField label="nip_number" value={customs?.options?.nip_number} name="nip_number" fieldClass="column mb-0 is-5 px-2 py-1"
                onChange={e => dispatch({ name: 'options', value: { ...(customs.options || {}), nip_number: e.target.value } })} />

              <InputField label="eori_number" value={customs?.options?.eori_number} name="eori_number" fieldClass="column mb-0 is-5 px-2 py-1"
                onChange={e => dispatch({ name: 'options', value: { ...(customs.options || {}), eori_number: e.target.value } })} />

            </div>
          </article>
        </div>

        {/* Commodities */}
        <div className="columns p-2 my-2">
          <article className="panel is-white is-shadowless column is-12 p-0" style={{ border: "1px #ddd solid" }}>
            <p className="panel-heading select is-fullwidth px-2 pt-3" onClick={() => setCommoditiesExpanded(!commoditiesExpanded)}>
              <span className="is-size-6">Customs commodities</span>
            </p>

            {commoditiesExpanded && <div style={{ display: `${commoditiesExpanded ? 'block' : 'none'}` }}>

              <div className="panel-block">
                <button className="button is-small is-light is-success is-pulled-right" onClick={e => { e.preventDefault(); toggleCommodity(); return false; }}>
                  <span>Add</span>
                </button>
              </div>

              {((customs?.commodities || []).length === 0) && <div className="panel-block is-justify-content-center">
                <div className="has-text-centered">
                  <p>No commodity declared yet.</p>
                  <p>Use the button above to add</p>
                </div>
              </div>}

              {(customs?.commodities || []).map((commodity: CommodityType) => (
                <div key={`${commodity.id}-${Date.now()}`} className="panel-block is-justify-content-space-between">
                  <CommodityDescription commodity={commodity} />
                  <div className="buttons">
                    <button type="button" className="button is-small is-white" onClick={e => { e.preventDefault(); toggleCommodity(commodity); return false; }}>
                      <span className="icon is-small"><i className="fas fa-pen"></i></span>
                    </button>
                    <button type="button" className="button is-small is-white" onClick={e => { e.preventDefault(); removeCommodity(commodity.id); return false; }}>
                      <span className="icon is-small"><i className="fas fa-trash"></i></span>
                    </button>
                  </div>
                </div>
              ))}

            </div>}
          </article>
        </div>

        {/* Customs Summary and signature */}
        <div className="columns is-multiline mb-6 pt-2">

          <TextAreaField label="content description" value={customs?.content_description} onChange={handleChange} name="content_description"
            fieldClass="column mb-0 is-12 px-2 py-2" placeholder="Content type description" rows={2} />

          <UserData.Consumer>
            {({ user }) => (
              <InputField label="Signed By" value={(customs?.signer || user?.full_name) as string} onChange={handleChange} name="signer" fieldClass="column mb-0 is-12 px-2 py-2" required={!cannotOptOut} />
            )}
          </UserData.Consumer>

          <CheckBoxField defaultChecked={customs?.certify} onChange={handleChange} name="certify" fieldClass="column mb-0 is-12 px-2 pt-2 pb-4">
            <span>I certify this customs declaration.</span>
          </CheckBoxField>

        </div>

        <ButtonField type="submit"
          className={`is-primary ${loading ? 'is-loading' : ''} m-0`}
          fieldClass="form-floating-footer p-2"
          controlClass="has-text-centered"
          disabled={deepEqual(value, customs) && deepEqual(value?.duty, customs?.duty) && deepEqual(value?.options, customs?.options)}>
          <span>Save</span>
        </ButtonField>

      </form>}

      {(!isNone(customs) && editCommodity) && <div className="block" style={{ display: `${editCommodity ? 'block' : 'none'}` }}>
        <button type="button"
          className="button is-light mb-3 mx-0"
          onClick={e => { e.preventDefault(); toggleCommodity(); return false; }}
          disabled={loading}>
          <span className="icon is-small is-dark"><i className="fas fa-arrow-left"></i></span>
        </button>
        <CommodityForm value={commodity} update={refreshCommodities} />
      </div>}
    </>
  )
};

export default CustomsInfoForm;