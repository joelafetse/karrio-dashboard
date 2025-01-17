import React, { useState, useRef, useContext } from 'react';
import { DocumentTemplateType, NotificationType, ShipmentType } from '@/lib/types';
import { Notify } from '@/components/notifier';
import { ShipmentsContext } from '@/context/shipments-provider';
import { isNone } from '@/lib/helper';
import { AppMode } from '@/context/app-mode-provider';
import { useRouter } from 'next/dist/client/router';
import { ShipmentMutationContext } from '@/context/shipment-mutation';
import { ShipmentStatusEnum } from 'karrio/graphql';
import { KARRIO_API } from '@/client/context';


interface ShipmentMenuComponent extends React.InputHTMLAttributes<HTMLDivElement> {
  shipment: ShipmentType;
  templates?: DocumentTemplateType[];
}


const ShipmentMenu: React.FC<ShipmentMenuComponent> = ({ shipment, templates, className, style, onClick }) => {
  const router = useRouter();
  const { notify } = useContext(Notify);
  const { basePath } = useContext(AppMode);
  const { voidLabel } = useContext(ShipmentMutationContext);
  const shipments = useContext(ShipmentsContext);
  const trigger = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  const handleOnClick = (e: React.MouseEvent) => {
    setIsActive(!isActive);
    if (!isActive) { document.addEventListener('click', onBodyClick); }
    else { document.removeEventListener('click', onBodyClick); }
  };
  const onBodyClick = (e: MouseEvent) => {
    if (!trigger.current?.contains(e.target as Node)) {
      setIsActive(false);
      document.removeEventListener('click', onBodyClick);
    }
  };
  const createLabel = (_: React.MouseEvent) => {
    router.push(basePath + '/create_label?shipment_id=' + shipment.id);
  };
  const displayDetails = (_: React.MouseEvent) => {
    router.push(basePath + '/shipments/' + shipment.id);
  };
  const cancelShipment = (shipment: ShipmentType) => async (e: React.MouseEvent) => {
    try {
      await voidLabel(shipment);
      notify({ type: NotificationType.success, message: 'Shipment successfully cancelled!' });
      shipments.refetch();
    } catch (err: any) {
      notify({ type: NotificationType.error, message: err });
    }
  };

  return (
    <div className="field has-addons">
      <p className="control is-expanded">
        {!isNone(shipment.label_url) &&
          <a className="button is-small is-fullwidth" href={`${KARRIO_API}${shipment?.label_url}`}
            target="_blank" rel="noreferrer">
            <span>Print Label</span>
          </a>}
        {isNone(shipment.label_url) && shipment.status === ShipmentStatusEnum.draft &&
          <a className="button is-small is-fullwidth" onClick={createLabel}>
            <span>Buy Label</span>
          </a>}
        {isNone(shipment.label_url) && shipment.status === ShipmentStatusEnum.cancelled &&
          <a className="button is-small is-fullwidth" onClick={displayDetails}>
            <span>View Shipment</span>
          </a>}
      </p>

      <p className="control" onClick={handleOnClick} ref={trigger}>
        <a className="button is-default is-small p-3">
          <i className="fas fa-angle-down" aria-hidden="true"></i>
        </a>
      </p>

      <div className={`dropdown is-right ${isActive ? 'is-active' : ''}`} key={`menu-${shipment.id}`}>
        <div className="dropdown-menu" id={`shipment-menu-${shipment.id}`} role="menu">
          <div className="dropdown-content">
            <a className="dropdown-item" onClick={displayDetails}>View Shipment</a>
            {shipment.status !== ShipmentStatusEnum.cancelled &&
              <a className="dropdown-item" onClick={cancelShipment(shipment)}>Cancel Shipment</a>}
            {!isNone(shipment.invoice_url) &&
              <a className="dropdown-item" href={`${KARRIO_API}${shipment.invoice_url}`}
                target="_blank" rel="noreferrer">Print Invoice</a>}
            {(templates || []).map(template =>
              <a href={`${KARRIO_API}/documents/${template.id}.${template.slug}?shipments=${shipment.id}`}
                className="dropdown-item" target="_blank" rel="noreferrer" key={template.id}>
                Download {template.name}
              </a>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ShipmentMenu;
