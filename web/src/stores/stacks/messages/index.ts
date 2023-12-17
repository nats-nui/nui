import { PayloadMessage, SocketService } from "@/plugins/SocketService"
import cnnSo from "@/stores/connections"
import docsSo from "@/stores/docs"
import { buildStore, createUUID } from "@/stores/docs/utils/factory"
import docSetup, { ViewStore } from "@/stores/docs/viewBase"
import { DOC_TYPE, Subscription } from "@/types"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../../docs/viewBase"
import { HistoryMessage, PARAMS_MESSAGES } from "./utils"
import { MessageState } from "../message"
import { MessageSendState } from "../send"



const data = [
	{
		"context": {
		  "client": {
			"hl": "it",
			"gl": "IT",
			"remoteHost": "193.207.103.255",
			"deviceMake": "",
			"deviceModel": "",
			"visitorData": "CgtkSHlOX0tmcVNvdyi_5OirBjIKCgJJVBIEEgAgTg%3D%3D",
			"userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36,gzip(gfe)",
			"clientName": "WEB",
			"clientVersion": "2.20231211.08.00",
			"osName": "Windows",
			"osVersion": "10.0",
			"originalUrl": "https://www.youtube.com/watch?v=IzAR90gnyHI&pp=YAHIAQE%3D",
			"platform": "DESKTOP",
			"clientFormFactor": "UNKNOWN_FORM_FACTOR",
			"configInfo": {
			  "appInstallData": "CL_k6KsGEPufsAUQlc-vBRC--a8FEJj8_hIQvbauBRC-irAFEOvo_hIQ2piwBRClwv4SEOuTrgUQt-r-EhCei7AFEKKSsAUQ1KGvBRDNlbAFELedsAUQ9fmvBRCIh7AFEOrDrwUQ54b_EhCpoLAFENWIsAUQ0-GvBRC8-a8FEIjjrwUQooGwBRComrAFEKy3rwUQ0I2wBRCJ6K4FELfvrwUQ7qKvBRCrgrAFENnJrwUQmvCvBRD6n7AFENfprwUQppqwBRCkoLAFEK7U_hIQ-pKwBRC9mbAFENyZsAUQ3ej-EhDh8q8FEJT6_hIQl4OwBRDcgrAFEKn3rwUQ0OKvBRCZkbAFEPCcsAUQzN-uBRDJ968FEMyu_hIQ6YywBRDbr68FEKegsAUQuIuuBRDks_4SEMeDsAUQ_IWwBRDnuq8FEKaBsAUQ4tSuBRCZlLAFEKehsAUQg9-vBRD-n7AFEPeasAUQyPy3IhCOhf8SELicsAU%3D"
			},
			"userInterfaceTheme": "USER_INTERFACE_THEME_DARK",
			"timeZone": "Europe/Rome",
			"browserName": "Chrome",
			"browserVersion": "120.0.0.0",
			"acceptHeader": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"deviceExperimentId": "ChxOek14TWpJeE1qRTVNVEkxTWpNM05ERXlNQT09EL_k6KsGGL_k6KsG",
			"screenWidthPoints": 1065,
			"screenHeightPoints": 993,
			"screenPixelDensity": 1,
			"screenDensityFloat": 1,
			"utcOffsetMinutes": 60,
			"memoryTotalKbytes": "8000000",
			"clientScreen": "WATCH",
			"mainAppWebInfo": {
			  "graftUrl": "/watch?v=IzAR90gnyHI&pp=YAHIAQE%3D",
			  "pwaInstallabilityStatus": "PWA_INSTALLABILITY_STATUS_CAN_BE_INSTALLED",
			  "webDisplayMode": "WEB_DISPLAY_MODE_BROWSER",
			  "isWebNativeShareAvailable": true
			}
		  },
		  "user": {
			"lockedSafetyMode": false
		  },
		  "request": {
			"useSsl": true,
			"internalExperimentFlags": [],
			"consistencyTokenJars": []
		  },
		  "clickTracking": {
			"clickTrackingParams": "CPQEENwwIhMItc-Fir2NgwMViUR6BR2aXgaKMgpnLWhpZ2gtcmVjWg9GRXdoYXRfdG9fd2F0Y2iaAQYQjh4YngE="
		  },
		  "adSignalsInfo": {
			"params": [
			  {
				"key": "dt",
				"value": "1702507072719"
			  },
			  {
				"key": "flash",
				"value": "0"
			  },
			  {
				"key": "frm",
				"value": "0"
			  },
			  {
				"key": "u_tz",
				"value": "60"
			  },
			  {
				"key": "u_his",
				"value": "2"
			  },
			  {
				"key": "u_h",
				"value": "1080"
			  },
			  {
				"key": "u_w",
				"value": "1920"
			  },
			  {
				"key": "u_ah",
				"value": "1080"
			  },
			  {
				"key": "u_aw",
				"value": "1920"
			  },
			  {
				"key": "u_cd",
				"value": "24"
			  },
			  {
				"key": "bc",
				"value": "31"
			  },
			  {
				"key": "bih",
				"value": "993"
			  },
			  {
				"key": "biw",
				"value": "1049"
			  },
			  {
				"key": "brdim",
				"value": "0,-1080,0,-1080,1920,-1080,1920,1080,1065,993"
			  },
			  {
				"key": "vis",
				"value": "1"
			  },
			  {
				"key": "wgl",
				"value": "true"
			  },
			  {
				"key": "ca_type",
				"value": "image"
			  }
			],
			"bid": "ANyPxKpOfW63xlGDqf4H2WK7ChuTnZ6WH1w2wwH9aCtKpRPT1SW85KYyMtcu4jKBRRjsE4X6K7QFD6649uUvZLcxD1AuPRXy-Q"
		  }
		},
		"videoId": "IzAR90gnyHI",
		"params": "YAHIAQE%3D",
		"playbackContext": {
		  "contentPlaybackContext": {
			"currentUrl": "/watch?v=IzAR90gnyHI&pp=YAHIAQE%3D",
			"vis": 5,
			"splay": false,
			"autoCaptionsDefaultOn": false,
			"autonavState": "STATE_NONE",
			"html5Preference": "HTML5_PREF_WANTS",
			"signatureTimestamp": 19702,
			"autoplay": true,
			"autonav": true,
			"referer": "https://www.youtube.com/",
			"lactMilliseconds": "-1",
			"watchAmbientModeContext": {
			  "hasShownAmbientMode": true,
			  "hasToggledOffAmbientMode": true
			}
		  }
		},
		"racyCheckOk": false,
		"contentCheckOk": false
	  },
	{
		"id": 98,
		"name": "veg1",
		"is_batch": false,
		"farm_ids": [
			13,
			4
		],
		"total_days": 5,
		"tag_list": [],
		"autotag_list": [
			"germination",
			"growing",
			"3+2"
		],
		"days": [
			{
				"position": 1,
				"phase": "germination",
				"nutrient_solution_id": 1,
				"ph": 9,
				"ec": 5,
				"irrigation_duration": 0,
				"irrigation_pause": 0,
				"day_photo_period": 6,
				"night_photo_period": 6,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 7,
				"temp_night": 7,
				"hum_day": 9,
				"hum_night": 9,
				"co2": 4
			},
			{
				"position": 1,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 9,
				"ec": 5,
				"irrigation_duration": 0,
				"irrigation_pause": 0,
				"day_photo_period": 1,
				"night_photo_period": 11,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 7,
				"temp_night": 7,
				"hum_day": 9,
				"hum_night": 9,
				"co2": 4
			},
			{
				"position": 2,
				"phase": "germination",
				"nutrient_solution_id": 1,
				"ph": 9,
				"ec": 5,
				"irrigation_duration": 0,
				"irrigation_pause": 0,
				"day_photo_period": 6,
				"night_photo_period": 6,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 7,
				"temp_night": 7,
				"hum_day": 9,
				"hum_night": 9,
				"co2": 4
			},
			{
				"position": 2,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 9,
				"ec": 5,
				"irrigation_duration": 0,
				"irrigation_pause": 0,
				"day_photo_period": 1,
				"night_photo_period": 11,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 7,
				"temp_night": 7,
				"hum_day": 9,
				"hum_night": 9,
				"co2": 4
			},
			{
				"position": 3,
				"phase": "germination",
				"nutrient_solution_id": 1,
				"ph": 9,
				"ec": 5,
				"irrigation_duration": 0,
				"irrigation_pause": 0,
				"day_photo_period": 8,
				"night_photo_period": 4,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 7,
				"temp_night": 7,
				"hum_day": 9,
				"hum_night": 9,
				"co2": 4
			}
		]
	},
	{
		"id": 100,
		"name": "rec1",
		"is_batch": false,
		"farm_ids": [
			4
		],
		"total_days": 3,
		"tag_list": [],
		"autotag_list": [
			"germination",
			"hd-growing",
			"ld-growing",
			"1+1+1"
		],
		"days": [
			{
				"position": 1,
				"phase": "germination",
				"nutrient_solution_id": null,
				"ph": 0,
				"ec": 0,
				"irrigation_duration": 1,
				"irrigation_pause": 1,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 0,
				"hum_night": 0,
				"co2": 0
			},
			{
				"position": 1,
				"phase": "hd-growing",
				"nutrient_solution_id": null,
				"ph": 0,
				"ec": 0,
				"irrigation_duration": 1,
				"irrigation_pause": 1,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 0,
				"hum_night": 0,
				"co2": 0
			},
			{
				"position": 1,
				"phase": "ld-growing",
				"nutrient_solution_id": null,
				"ph": 0,
				"ec": 0,
				"irrigation_duration": 1,
				"irrigation_pause": 1,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 0,
				"hum_night": 0,
				"co2": 0
			}
		]
	},
	{
		"id": 91,
		"name": "capriolo_lattuga_germi",
		"is_batch": false,
		"farm_ids": [
			14,
			13,
			4,
			12,
			3,
			7
		],
		"total_days": 7,
		"tag_list": [],
		"autotag_list": [
			"germination",
			"growing",
			"4+3"
		],
		"days": [
			{
				"position": 1,
				"phase": "germination",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 10,
				"irrigation_pause": 10,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 1,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 1,
				"irrigation_pause": 1,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 2,
				"phase": "germination",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 10,
				"irrigation_pause": 10,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 2,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 1,
				"irrigation_pause": 1,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 3,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 1,
				"irrigation_pause": 1,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 3,
				"phase": "germination",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 10,
				"irrigation_pause": 10,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 4,
				"phase": "germination",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 10,
				"irrigation_pause": 10,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			}
		]
	},
	{
		"id": 89,
		"name": "capriolo_lattuga",
		"is_batch": false,
		"farm_ids": [
			14,
			13
		],
		"total_days": 4,
		"tag_list": [],
		"autotag_list": [
			"growing",
			"4"
		],
		"days": [
			{
				"position": 1,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 10,
				"irrigation_pause": 10,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 1,
				"spectrum": 1,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 2,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 20,
				"irrigation_pause": 20,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 3,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 30,
				"irrigation_pause": 30,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			},
			{
				"position": 4,
				"phase": "growing",
				"nutrient_solution_id": 1,
				"ph": 6,
				"ec": 61,
				"irrigation_duration": 40,
				"irrigation_pause": 40,
				"day_photo_period": 1,
				"night_photo_period": 1,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 2,
				"temp_night": 2,
				"hum_day": 1,
				"hum_night": 1,
				"co2": 1
			}
		]
	},
	{
		"id": 103,
		"name": "capriolus_lattuga_gel",
		"is_batch": false,
		"farm_ids": [
			14
		],
		"total_days": 17,
		"tag_list": [],
		"autotag_list": [
			"germination",
			"growing",
			"2+15"
		],
		"days": [
			{
				"position": 1,
				"phase": "germination",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 5,
				"irrigation_pause": 50,
				"day_photo_period": 0,
				"night_photo_period": 24,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 1,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 6,
				"night_photo_period": 6,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 2,
				"phase": "germination",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 5,
				"irrigation_pause": 50,
				"day_photo_period": 0,
				"night_photo_period": 24,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 2,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 6,
				"night_photo_period": 6,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 3,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 6,
				"night_photo_period": 6,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 4,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 9,
				"night_photo_period": 3,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 5,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 9,
				"night_photo_period": 3,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 6,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 9,
				"night_photo_period": 3,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 7,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 9,
				"night_photo_period": 3,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 8,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 9,
				"night_photo_period": 3,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 9,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 9,
				"night_photo_period": 3,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 10,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 9,
				"night_photo_period": 3,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 11,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 9,
				"night_photo_period": 3,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 12,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 12,
				"night_photo_period": 0,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 13,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 12,
				"night_photo_period": 0,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 14,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 12,
				"night_photo_period": 0,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			},
			{
				"position": 15,
				"phase": "growing",
				"nutrient_solution_id": null,
				"ph": 5,
				"ec": 20,
				"irrigation_duration": 2,
				"irrigation_pause": 50,
				"day_photo_period": 12,
				"night_photo_period": 0,
				"led_bars": 0,
				"spectrum": 0,
				"temp_day": 0,
				"temp_night": 0,
				"hum_day": 20,
				"hum_night": 20,
				"co2": 20
			}
		]
	}
]

const h: HistoryMessage[] = Array.from({ length: 6 }, (_, i) => ({
	id: createUUID(),
	title: `title-${Math.random()} [${i}]`,
	//body: `body ${i} - ${"a".repeat(Math.round(Math.random() * 200))}`,
	json: data[i],
	timestamp: Date.now(),
	height: null,
}));



const setup = {

	state: {
		params: {
			[PARAMS_MESSAGES.CONNECTION_ID]: <string[]>null
		},
		subscriptions: <Subscription[]>[],
		lastSubjects: <string[]>null,
		history: <HistoryMessage[]>[],
		textSearch: <string>null,
		subscriptionsOpen: false,
		typesOpen: false,
	},

	getters: {
		getConnection: (_: void, store?: MessagesStore) => {
			const id = store.getParam(PARAMS_MESSAGES.CONNECTION_ID)
			return cnnSo.getById(id)
		},
		getTitle: (_: void, store?: ViewStore) => (<MessagesStore>store).getConnection()?.name,
	},

	actions: {
		/** mi connetto al websocket */
		connect(_: void, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			store.setSubscriptions([...cnn.subscriptions])

			//[II] mettere tutti i socketservices all'interno di un servizio esterno
			store.ss = new SocketService({
				onMessage: message => store.addInHistory(message)
			})
			store.ss.onOpen = () => store.sendSubscriptions()
			store.ss.connect(store.getParam(PARAMS_MESSAGES.CONNECTION_ID))
		},
		/** disconnessione websocket */
		disconnect(_: void, store?: MessagesStore) {
			console.log("disconnect")
			//store.ss.sendSubjects([])
			store.ss.disconnect()
			store.ss = null
		},
		/** aggiungo alla history di questo stack */
		addInHistory(message: PayloadMessage, store?: MessagesStore) {
			const historyMessage: HistoryMessage = {
				id: createUUID(),
				title: `${message.subject} [${store.state.history.length}]`,
				body: message.payload as string,
				timestamp: Date.now(),
			}
			store.setHistory([...store.state.history, historyMessage])
		},
		/** aggiorno i subjects di questo stack messages */
		sendSubscriptions: (_: void, store?: MessagesStore) => {
			const subjects = store.state.subscriptions
				?.filter(s => !!s?.subject && !s.disabled)
				.map(s => s.subject) ?? []
			if (store.state.lastSubjects && store.state.lastSubjects.length == subjects.length  && subjects.every(s => store.state.lastSubjects.includes(s))) return
			store.ss.sendSubjects(subjects)
			store.state.lastSubjects = subjects
		},
		/** apertura CARD MESSAGE-DETAIL */
		openMessageDetail(message: HistoryMessage, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			const msgStore = buildStore({
				type: DOC_TYPE.MESSAGE,
				message
			} as MessageState)
			docsSo.addLink({
				view: msgStore,
				parent: store,
				anim: true,
			})
		},
		/** apertura CARD MESSAGE-SEND */
		openMessageSend(_: void, store?: MessagesStore) {
			const cnn = store.getConnection()
			if (!cnn) return
			const msgSendStore = buildStore({
				type: DOC_TYPE.MESSAGE_SEND,
				connectionId: cnn.id,
			} as MessageSendState)
			docsSo.addLink({
				view: msgSendStore,
				parent: store,
				anim: true,
			})
		},
	},

	mutators: {
		setSubscriptions: (subscriptions: Subscription[]) => ({ subscriptions }),
		setHistory: (history: HistoryMessage[]) => ({ history }),
		setSubscriptionsOpen: (subscriptionsOpen: boolean) => ({ subscriptionsOpen }),
		setTypesOpen: (typesOpen: boolean) => ({ typesOpen }),
		setTextSearch: (textSearch: string) => ({ textSearch }),
	},
}

export type MessagesState = typeof setup.state & ViewState
export type MessagesGetters = typeof setup.getters
export type MessagesActions = typeof setup.actions
export type MEssagesMutators = typeof setup.mutators
export interface MessagesStore extends ViewStore, StoreCore<MessagesState>, MessagesGetters, MessagesActions, MEssagesMutators {
	state: MessagesState
	ss: SocketService
}
const msgSetup = mixStores(docSetup, setup)
export default msgSetup


