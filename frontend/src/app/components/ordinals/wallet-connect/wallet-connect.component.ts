import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef, NgbPopover } from '@ng-bootstrap/ng-bootstrap';

import { KnownOrdinalWallets, KnownOrdinalWalletType, WalletInfo, WalletService } from '../../../services/ordinals/wallet.service';


@Component({
  selector: 'app-wallet-connect',
  templateUrl: './wallet-connect.component.html',
  styleUrls: ['./wallet-connect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletConnectComponent {

  connectButtonDisabled = false;

  modalService = inject(NgbModal);
  walletService = inject(WalletService);

  installedWallets$ = this.walletService.wallets$;
  connectedWallet$ = this.walletService.connectedWallet$;
  walletConnectRequested$ = this.walletService.walletConnectRequested$;

  knownOrdinalWallets = KnownOrdinalWallets;

  @ViewChild('connect') connectTemplateRef: TemplateRef<any>;
  modalRef: NgbModalRef | undefined;

  constructor() {
    this.walletConnectRequested$.subscribe(() => this.open());

  }

  open(): void {
    this.connectButtonDisabled = false;

    this.modalRef = this.modalService.open(this.connectTemplateRef, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true
    });
  }

  close(): void {
    this.modalRef?.close();
    this.connectButtonDisabled = false;
  }

  disconnect(popover: NgbPopover): void {

    // Close the popover
    popover.close();

    this.walletService.disconnectWallet();
  }

  connectWallet(key: KnownOrdinalWalletType): void {

    // Unisat docs:
    // https://docs.unisat.io/dev/unisat-developer-service/unisat-wallet
    // 1. You should only initiate a connection request in response to direct user action, such as clicking a button.
    // 2. You should always disable the 'connect' button while the connection request is pending.
    // 3. You should never initiate a connection request on page load.

    if (key !== KnownOrdinalWalletType.leather) { // leather has no cancel event
      this.connectButtonDisabled = true;
    }

    this.walletService.connectWallet(key).pipe().subscribe({
      next: () => this.close(),
      error: (err) => {
        console.log('*** Error while connecting ***', err);
        this.close(); }
    });
  }

  connectFakeWallet(): void {

    const walletInfo: WalletInfo = {
      type: KnownOrdinalWalletType.xverse,
      ordinalsAddress: 'bc1p64fa7mjsvlfcutnfapwhxyuvchxgk22l4at7xsh4z02tuuqwaj5syt6x2e',
      ordinalsPublicKey: '5df12ac222a1cd78dd4681c7c7a56f3e273884a086b2b6100957d20c73be3c37',
      paymentAddress: '3Ec1WB9ihWTxAfZSpGmQpNq4pr4goi3KgP',
      paymentPublicKey: '0278875d226dd610b06c41d698c9fe0ea4915c797ddc31a3310299d9acd07ff37b',
    };

    this.walletService.connectFakeWallet(walletInfo);
    this.close();
  }
}

