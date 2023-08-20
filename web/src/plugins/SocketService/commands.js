/* eslint eqeqeq: "off"*/
import {getStoreAntenna} from "../../store/antenna";
import {getStoreAntennaSys} from "../../store/antennaSys";
import {getStoreChart} from "../../store/chart";
import {getStoreShip} from "../../store/ship";
import {getStoreSlu} from "../../store/slu";
import {getStoreSchema} from "../../store/schema";
import {getStoreBuc} from "../../store/buc";
import {getStoreDashboard} from "../../store/dashboard";


export class Commands {
	constructor(server) {
		this.server = server
	}

	table = {

		"ping": payload => this.server.ping.onMessage(),

		"rulesengine.event.antennasystem.status": activity => {
			setAntenna(activity.antennas[0])
			setAntenna(activity.antennas[1])
			setSlu(activity.slu)
			setAntennaSys(activity)
			setBucs(activity.bucs)
		},

		"rulesengine.event.ship.status": activity => {
			setShip(activity.ship_params)
		},

		"diagnostics.event.subsystems.status": activity => {
			setDiagnostic(activity.subsystems)
		},

		"rulesengine.event.antennasystem.currentconnections": activity => {
			setCurrentConnection(activity)
		},


		"measure_response": activity => {
			setChart(activity)
		}

	}

	exe(data) {
		const cmm = this.table[data.subject]
		if (!cmm) return
		cmm(data.activity);
	}
}

function setAntenna(antenna) {
	const { state, setAcu, fetchThreshold } = getStoreAntenna(antenna.antenna_number)
	const oldSatNumber = state.acu.params.tracked_sat_params?.number
	const newSatNumber = antenna.params.tracked_sat_params?.number
	setAcu ( antenna )
	if ( oldSatNumber != newSatNumber ) fetchThreshold()
}

function setBucs( bucs ) {
	const { setCurrent } = getStoreBuc()
	setCurrent(bucs)
}

function setShip({ longitude, latitude, heading }) {
	const { setAcu } = getStoreShip()
	setAcu({ longitude, latitude, heading })
}

function setSlu(matrix) {
	const { setAcu } = getStoreSlu()
	setAcu(matrix)
}

function setChart(data) {
	const { setAcu } = getStoreChart()
	setAcu(data)
}

function setAntennaSys(data) {
	const { setAcu } = getStoreAntennaSys()
	setAcu({
		mode: data.mode,
		antenna1Band: data.antenna_1_band,
		antenna2Band: data.antenna_2_band,
		shareModems: data.share_modems,
	})
}

function setDiagnostic(data) {
	const { setSubsystems } = getStoreSchema()
	setSubsystems(data)
}

function setCurrentConnection(data) {
	const { setAcu, setModem } = getStoreDashboard()
	setAcu(data.acu_rf_connections)
	setModem(data.modem_rf_connections)
}