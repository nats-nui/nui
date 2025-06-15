import { CnnDetailStore } from "@/stores/stacks/connection/detail"
import { Auth, AUTH_MODE, EDIT_STATE } from "@/types"
import { Accordion, IconToggle, ListDialog, StringUpRow, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import AuthCmp from "./AuthCmp"



interface Props {
	store: CnnDetailStore
}

/**
 * Component for managing connection metrics configuration
 */
const ConnectionMetricsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const cnnDetailSa = useStore(store)

	// HANDLER
	const metricNormalize = () => {
		if (!!cnnDetailSa.connection.metrics) return
		cnnDetailSa.connection.metrics = {
			httpSource: { active: false, url: "" },
			natsSource: { active: false, auth: { mode: AUTH_MODE.TOKEN } },
		}
	}

	const handleMetricAuthModeChange = (index: number) => {
		metricNormalize()
		const mode = Object.values(AUTH_MODE)[index]
		cnnDetailSa.connection.metrics.natsSource.auth.mode = mode
		store._update()
	}
	const handleMetricAuthChange = (auth: Auth) => {
		metricNormalize()
		const current = cnnDetailSa.connection.metrics.natsSource.auth
		cnnDetailSa.connection.metrics.natsSource.auth = { ...current, ...auth }
		store._update()
	}
	const handleMetricHttpSourceChange = (check: boolean) => {
		metricNormalize()
		cnnDetailSa.connection.metrics.httpSource.active = check
		if (check) cnnDetailSa.connection.metrics.natsSource.active = false
		store._update()
	}
	const handleMetricNatsSourceChange = (check: boolean) => {
		metricNormalize()
		cnnDetailSa.connection.metrics.natsSource.active = check
		if (check) cnnDetailSa.connection.metrics.httpSource.active = false
		store._update()
	}
	const handleMetricUrlChange = (url: string) => {
		metricNormalize()
		cnnDetailSa.connection.metrics.httpSource.url = url
		store._update()
	}

	// RENDER
	const connection = store.getConnection()
	if (connection == null) return null

	const inRead = cnnDetailSa.editState == EDIT_STATE.READ

	const metricAuthModes = Object.values(AUTH_MODE)
	const matricAuth = connection.metrics?.natsSource?.auth
	const metricAuthModeSelected = Object.values(AUTH_MODE).indexOf(matricAuth?.mode ?? AUTH_MODE.TOKEN)
	const metricHttpActive = connection.metrics?.httpSource?.active ?? false
	const metricNatsActive = connection.metrics?.natsSource?.active ?? false
	const metricUrl = connection.metrics?.httpSource?.url ?? ""

	return <>

		<div className="lyt-v">

			<div className="jack-cmp-h">
				<IconToggle
					check={metricHttpActive}
					onChange={handleMetricHttpSourceChange}
					readOnly={inRead}
				/>
				<div className="jack-lbl-prop">HTTP SOURCE</div>
			</div>

			<Accordion open={metricHttpActive}>
				<div className="jack-lyt-quote">
					<div className="lyt-v">
						<div className="jack-lbl-prop">URL</div>
						<TextInput autoFocus
							value={metricUrl}
							onChange={handleMetricUrlChange}
							readOnly={inRead}
						/>
					</div>
				</div>
			</Accordion>

		</div>

		<div className="lyt-v">

			<div className="jack-cmp-h">
				<IconToggle
					check={metricNatsActive}
					onChange={handleMetricNatsSourceChange}
					readOnly={inRead}
				/>
				<div className="jack-lbl-prop">NATS SOURCE</div>
			</div>

			<Accordion open={metricNatsActive}>
				<div className="jack-lyt-quote">
					<ListDialog
						store={store}
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
			</Accordion>

		</div>

	</>

}

export default ConnectionMetricsCmp
