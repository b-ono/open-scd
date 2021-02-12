import {
  LitElement,
  html,
  TemplateResult,
  property,
  css,
  query,
} from 'lit-element';
import { translate, get } from 'lit-translate';

import { List } from '@material/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';

import { newActionEvent, newWizardEvent, Wizard } from '../foundation.js';
import { WizardOptions } from './mapping/foundation.js';
import { styles } from './mapping/foundation.js';

type ServiceType = 'GOOSE' | 'SMV' | 'Report';
interface ConnectWizardOptions {
  input: Element;
  output: Element;
  serviceType: ServiceType;
}

/** An editor [[`plugin`]] for editing the `DataTypeTemplates` section. */
export default class MappingPlugin extends LitElement {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property()
  doc!: XMLDocument;

  @property()
  get input(): Element | null {
    return this.doc.querySelector(
      `:root > IED[name="${(<ListItem>this.inputUI.selected).value}"]`
    );
  }
  @property()
  get output(): Element | null {
    return this.doc.querySelector(
      `:root > IED[name="${(<ListItem>this.outputUI.selected).value}"]`
    );
  }

  @query('#input') inputUI!: List;
  @query('#output') outputUI!: List;

  /** Opens a [[`WizardDialog`]] for connecting `IED`s. */
  async openConnectWizard(serviceType: ServiceType): Promise<void> {
    if (this.input && this.output)
      this.dispatchEvent(
        newWizardEvent(
          MappingPlugin.wizard({
            serviceType,
            input: this.input,
            output: this.output,
          })
        )
      );
  }

  static wizard(options: ConnectWizardOptions): Wizard {
    return [
      {
        title: `${options.serviceType}: ${options.input.getAttribute(
          'name'
        )} -> ${options.output.getAttribute('name')}`,
        content:
          options.serviceType === 'Report'
            ? [
                // wrap in div for two column grid display of content
                html`<div
                  class="wrapper"
                  style="display: grid; grid-template-columns: 1fr 1fr;"
                >
                  <style>
                    .wrapper > mwc-textfield,
                    .wrapper > mwc-list {
                      display: block;
                      margin-top: 8px;
                      margin-right: 16px;
                      margin-left: 16px;
                    }

                    .wrapper > mwc-list:nth-child(2n) {
                      border-right: 2px var(--base1) solid;
                      margin-right: 0px;
                      padding-right: 16px;
                    }
                  </style>
                  ${[
                    html` <mwc-textfield
                      icontrailing="search"
                      outlined=""
                      label="Sources"
                    ></mwc-textfield>`,
                    html`<mwc-textfield
                      icontrailing="search"
                      outlined=""
                      label="Sink"
                    ></mwc-textfield>`,
                    html`
                      <mwc-list activatable multi
                        >${Array.from(
                          options.input.querySelectorAll(
                            ':root > IED > AccessPoint > Server > LDevice > LN0 > ReportControl,' +
                              ':root > IED > AccessPoint > Server > LDevice > LN > ReportControl'
                          )
                        ).map(
                          rc =>
                            html`<mwc-list-item hasMeta
                              >${rc.getAttribute('name')}<mwc-icon slot="meta"
                                >info</mwc-icon
                              ></mwc-list-item
                            >`
                        )}</mwc-list
                      >
                      <mwc-list activatable
                        >${Array.from(
                          options.output.querySelectorAll(
                            ':root > IED > AccessPoint > Server > LDevice > LN0,' +
                              ':root > IED > AccessPoint > Server > LDevice > LN'
                          )
                        ).map(
                          ln =>
                            html`<mwc-list-item twoline>
                              <span
                                >${(ln.getAttribute('lnClass') ?? '') +
                                (ln.getAttribute('inst') ?? '')}</span
                              >
                              <span slot="secondary"
                                >${ln.parentElement!.getAttribute('inst')}</span
                              >
                            </mwc-list-item>`
                        )}</mwc-list
                      >
                    `,
                  ]}
                </div>`,
              ]
            : [],
      },
    ];
  }

  render(): TemplateResult {
    if (!this.doc?.querySelector(':root > IED'))
      return html`<h1>
        <span style="color: var(--base1)">${translate('ied.missing')}</span>
      </h1>`;
    return html`
      <mwc-list id="input" activatable>
        ${Array.from(this.doc.querySelectorAll(':root > IED') ?? []).map(
          IED =>
            html`<mwc-list-item value="${IED.getAttribute('name')}"
              >${IED.getAttribute('name')}</mwc-list-item
            >`
        )}
      </mwc-list>
      <mwc-list id="output" activatable>
        ${Array.from(this.doc.querySelectorAll(':root > IED') ?? []).map(
          IED =>
            html`<mwc-list-item value="${IED.getAttribute('name')}"
              >${IED.getAttribute('name')}</mwc-list-item
            >`
        )}
      </mwc-list>
      <mwc-button
        icon="coronavirus"
        @click=${() => this.openConnectWizard('GOOSE')}
        label="GOOSE"
      ></mwc-button>
      <mwc-button
        icon="coronavirus"
        @click=${() => this.openConnectWizard('SMV')}
        label="SMV"
      ></mwc-button>
      <mwc-button
        icon="coronavirus"
        @click=${() => this.openConnectWizard('Report')}
        label="Report"
      ></mwc-button>
    `;
  }

  static styles = css`
    ${styles}

    mwc-list {
      display: inline-block;
    }

    mwc-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
    }

    :host {
      width: 100vw;
    }
  `;
}
