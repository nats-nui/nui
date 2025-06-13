import CheckRadioOnIcon from "@/icons/CheckRadioOnIcon"
import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Auth, AUTH_MODE, EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import AuthForm from "./AuthForm"
import { EditList, EditStringRow, IconToggle, ListDialog, ListObjects, StringUpRow, TextInput, TitleAccordion, TooltipWrapCmp } from "@priolo/jack"
import AuthCmp from "./AuthCmp"



interface Props {
    cnnDetailSo: CnnDetailStore
}

/**
 * dettaglio di una CONNECTION
 */
const ConnectionDetailForm: FunctionComponent<Props> = ({
    cnnDetailSo,
}) => {

    // STORE
    const cnnDetailSa = useStore(cnnDetailSo)

    // HOOKs

    // HANDLER
    const handleChangeName = (name: string) => {
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection, name })
    }
    const handleHostsChange = (hosts: string[]) => {
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection, hosts })
    }
    const handleInboxPrefixChange = (inboxPrefix: string) => {
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection, inboxPrefix })
    }
    const handleAuthChange = (auth: Auth, index: number) => {
        if (!auth) return
        const cnnAuth = cnnDetailSa.connection.auth
        if (index == -1) cnnAuth.push(auth); else cnnAuth[index] = auth
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection })
    }
    const handleAuthDelete = (index: number) => {
        if (index < 0) return
        cnnDetailSa.connection.auth.splice(index, 1)
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection })
    }
    const handleActivate = (check: boolean, indexSel: number, e: React.MouseEvent) => {
        e.stopPropagation()
        cnnDetailSa.connection.auth.forEach((auth, index) => auth.active = check && index == indexSel)
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection })
    }

    const handleChangeTlsEnable = (enabled: boolean) => {
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection, tlsAuth: { ...cnnDetailSa.connection.tlsAuth, enabled } })
    }
    const handleChangeTlsCertPath = (certPath: string) => {
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection, tlsAuth: { ...cnnDetailSa.connection.tlsAuth, certPath } })
    }
    const handleChangeTlsKeyPath = (keyPath: string) => {
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection, tlsAuth: { ...cnnDetailSa.connection.tlsAuth, keyPath } })
    }
    const handleChangeTlsCaPath = (caPath: string) => {
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection, tlsAuth: { ...cnnDetailSa.connection.tlsAuth, caPath } })
    }
    const handleChangeHandshakeFirst = (handshakeFirst: boolean) => {
        cnnDetailSo.setConnection({ ...cnnDetailSa.connection, tlsAuth: { ...cnnDetailSa.connection.tlsAuth, handshakeFirst } })
    }

    const metricNormalize = () => {
        if (!!cnnDetailSa.connection.metrics) return
        cnnDetailSa.connection.metrics = {
            httpSource: { active: false, url: "" },
            natsSource: { active: false, auth: { mode: AUTH_MODE.TOKEN } },
        }
    }

    //#region METRIC
    const handleMetricAuthModeChange = (index: number) => {
        metricNormalize()
        const mode = Object.values(AUTH_MODE)[index]
        cnnDetailSa.connection.metrics.natsSource.auth.mode = mode
        cnnDetailSo._update()
    }
    const handleMetricAuthChange = (auth: Auth) => {
        metricNormalize()
        const current = cnnDetailSa.connection.metrics.natsSource.auth
        cnnDetailSa.connection.metrics.natsSource.auth = { ...current, ...auth }
        cnnDetailSo._update()
    }
    const handleMetricHttpSourceChange = (check:boolean) => {
        metricNormalize()
        cnnDetailSa.connection.metrics.httpSource.active = check
        cnnDetailSa.connection.metrics.natsSource.active = !check
        cnnDetailSo._update()   
    }
    const handleMetricNatsSourceChange = (check:boolean) => {
        metricNormalize()
        cnnDetailSa.connection.metrics.httpSource.active = !check
        cnnDetailSa.connection.metrics.natsSource.active = check
        cnnDetailSo._update()   
    }
    const handleMetricUrlChange = (url: string) => {
        metricNormalize()
        cnnDetailSa.connection.metrics.httpSource.url = url
        cnnDetailSo._update()
    }
    //#endregion

    // RENDER
    const connection = cnnDetailSo.getConnection()
    if (connection == null) return null
    const name = connection.name ?? ""
    const hosts = connection.hosts ?? []
    const auths = connection.auth ?? []
    const tlsAuth = connection.tlsAuth ?? { enabled: false, certPath: "", keyPath: "", caPath: "", handshakeFirst: false }
    const inRead = cnnDetailSa.editState == EDIT_STATE.READ

    const metricAuthModes = Object.values(AUTH_MODE)
    const matricAuth = connection.metrics?.natsSource?.auth
    const metricAuthModeSelected = Object.values(AUTH_MODE).indexOf(matricAuth?.mode ?? AUTH_MODE.TOKEN)
    const metricHttpActive =  cnnDetailSa.connection.metrics?.httpSource?.active ?? false
    const metricNatsActive = cnnDetailSa.connection.metrics?.natsSource?.active ?? false
    const metricUrl = cnnDetailSa.connection.metrics?.httpSource?.url ?? ""

    return <div className="jack-lyt-form var-dialog">

        <TitleAccordion title="BASE">
            <div className="lyt-v">
                <div className="jack-lbl-prop">NAME</div>
                <TextInput autoFocus
                    value={name}
                    onChange={handleChangeName}
                    readOnly={inRead}
                />
            </div>
            <div className="lyt-v">
                <div className="jack-lbl-prop">HOST</div>
                <EditList<string>
                    items={hosts}
                    onItemsChange={handleHostsChange}
                    readOnly={inRead}
                    placeholder="ex. demo.nats.io"

                    onNewItem={() => ""}
                    fnIsVoid={h => !h || h.trim().length == 0}
                    RenderRow={EditStringRow}
                />
            </div>
        </TitleAccordion>

        <TitleAccordion title="AUTH">
            <div className="lyt-v">
                <div className="jack-lbl-prop">AUTH</div>
                <ListObjects<Auth>
                    store={cnnDetailSo}
                    items={auths}
                    readOnly={inRead}
                    width={170}
                    RenderLabel={({ item: auth, index }) => (
                        <div className="jack-cmp-h">
                            <IconToggle
                                check={auth.active}
                                onChange={(check, e) => handleActivate(check, index, e)}
                                readOnly={inRead}
                                trueIcon={<CheckRadioOnIcon />}
                            />
                            {auth?.mode?.toUpperCase()}
                        </div>
                    )}
                    onDelete={handleAuthDelete}
                    RenderForm={({ item, index, onClose }) => (
                        <AuthForm
                            auth={item}
                            readOnly={inRead}
                            onClose={(auth) => {
                                onClose();
                                handleAuthChange(auth, index)
                            }}
                        />
                    )}
                />
            </div>
        </TitleAccordion>

        <TitleAccordion title="CLIENT TLS">
            < div className="jack-cmp-h">
                <IconToggle
                    check={!!tlsAuth.handshakeFirst}
                    onChange={handleChangeHandshakeFirst}
                    readOnly={inRead}
                />
                <div className="jack-lbl-prop">ENABLE HANDSHAKE FIRST</div>
            </div>
            < div className="jack-cmp-h">
                <IconToggle
                    check={!!tlsAuth.enabled}
                    onChange={handleChangeTlsEnable}
                    readOnly={inRead}
                />
                <div className="jack-lbl-prop">ENABLE AUTH</div>
            </div>
            <div className="lyt-v">
                <div className="jack-lbl-prop">CLIENT CERT PATH</div>
                <TextInput autoFocus
                    value={tlsAuth.certPath}
                    onChange={handleChangeTlsCertPath}
                    readOnly={inRead}
                />
            </div>
            <div className="lyt-v">
                <div className="jack-lbl-prop">CLIENT KEY PATH</div>
                <TextInput autoFocus
                    value={tlsAuth.keyPath}
                    onChange={handleChangeTlsKeyPath}
                    readOnly={inRead}
                />
            </div>
            <div className="lyt-v">
                <div className="jack-lbl-prop">CA PATH</div>
                <TextInput autoFocus
                    value={tlsAuth.caPath}
                    onChange={handleChangeTlsCaPath}
                    readOnly={inRead}
                />
            </div>
        </TitleAccordion>

        <TitleAccordion title="METRICS">

            <div className="lyt-v">
                <div className="jack-cmp-h">
                    <IconToggle
                        check={!!metricHttpActive}
                        onChange={handleMetricHttpSourceChange}
                        readOnly={inRead}
                    />
                    <div className="jack-lbl-prop">HTTP SOURCE</div>
                </div>
                <div className="lyt-v">
                    <div className="jack-lbl-prop">URL</div>
                    <TextInput autoFocus
                        value={metricUrl}
                        onChange={handleMetricUrlChange}
                        readOnly={inRead}
                    />
                </div>
            </div>

            <div className="lyt-v">

                <div className="jack-cmp-h">
                    <IconToggle
                        check={!!metricNatsActive}
                        onChange={handleMetricNatsSourceChange}
                        readOnly={inRead}
                    />
                    <div className="jack-lbl-prop">NATS SOURCE</div>
                </div>

                <ListDialog
                    store={cnnDetailSo}
                    select={metricAuthModeSelected}
                    items={metricAuthModes}
                    RenderRow={StringUpRow}
                    readOnly={inRead}
                    onSelect={handleMetricAuthModeChange}
                />

                <AuthCmp
                    auth={matricAuth}
                    readOnly={inRead}
                    onPropChange={handleMetricAuthChange}
                />

            </div>

        </TitleAccordion>

        <TitleAccordion title="ADVANCED">
            <div className="jack-lbl-prop lbl-info-container">INBOX PREFIX
                <TooltipWrapCmp className="lbl-info" children="?"
                    content="The prefix of subject used to receive responses in req /reply"
                />
            </div>
            <TextInput autoFocus
                value={connection.inboxPrefix}
                onChange={handleInboxPrefixChange}
                placeholder="eg. _INBOX.>"
                readOnly={inRead}
            />
        </TitleAccordion>

    </div>
}

export default ConnectionDetailForm
