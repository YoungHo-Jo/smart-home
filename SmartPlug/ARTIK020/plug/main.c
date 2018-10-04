/***********************************************************************************************//**
 * \file   main.c
 * \brief  Silicon Labs Thermometer Example Application
 *
 * This Thermometer and OTA example allows the user to measure temperature
 * using the temperature sensor on the WSTK. The values can be read with the
 * Health Thermometer reader on the Blue Gecko smartphone app.
 ***************************************************************************************************
 * <b> (C) Copyright 2016 Silicon Labs, http://www.silabs.com</b>
 ***************************************************************************************************
 * This file is licensed under the Silicon Labs License Agreement. See the file
 * "Silabs_License_Agreement.txt" for details. Before using this software for
 * any purpose, you must agree to the terms of that agreement.
 **************************************************************************************************/

/* Board Headers */
#include "init_mcu.h"
#include "init_board.h"
#include "init_app.h"
#include "ble-configuration.h"
#include "board_features.h"

/* Bluetooth stack headers */
#include "bg_types.h"
#include "native_gecko.h"
#include "infrastructure.h"

/* GATT database */
#include "gatt_db.h"

/* EM library (EMlib) */
#include "em_system.h"

/* Libraries containing default Gecko configuration values */
#include "em_emu.h"
#include "em_cmu.h"

/* Device initialization header */
#include "hal-config.h"

#ifdef FEATURE_BOARD_DETECTED
#if defined(HAL_CONFIG)
#include "bsphalconfig.h"
#else
#include "bspconfig.h"
#endif
#else
#error This sample app only works with a Silicon Labs Board
#endif

#include "i2cspm.h"
#include "si7013.h"
#include "tempsens.h"
#include "retargetserial.h"
#include "stdio.h"
#include "stdlib.h"
#include "init_adc.h"
#include "init_gpio.h"

/***********************************************************************************************//**
 * @addtogroup Application
 * @{
 **************************************************************************************************/

/***********************************************************************************************//**
 * @addtogroup app
 * @{
 **************************************************************************************************/

/* Gecko configuration parameters (see gecko_configuration.h) */
#ifndef MAX_CONNECTIONS
#define MAX_CONNECTIONS 4
#endif
uint8_t bluetooth_stack_heap[DEFAULT_BLUETOOTH_HEAP(MAX_CONNECTIONS)];

static const gecko_configuration_t config = { .config_flags = 0,
		.sleep.flags = 0, // Disable deep sleep
		.bluetooth.max_connections = MAX_CONNECTIONS, .bluetooth.heap =
				bluetooth_stack_heap, .bluetooth.heap_size =
				sizeof(bluetooth_stack_heap),
		.bluetooth.sleep_clock_accuracy = 100, // ppm
		.gattdb = &bg_gattdb_data, .ota.flags = 0, .ota.device_name_len = 3,
		.ota.device_name_ptr = "OTA",
#if (HAL_PA_ENABLE) && defined(FEATURE_PA_HIGH_POWER)
		.pa.config_enable = 1, // Enable high power PA
		.pa.input = GECKO_RADIO_PA_INPUT_VBAT,// Configure PA input to VBAT
#endif // (HAL_PA_ENABLE) && defined(FEATURE_PA_HIGH_POWER)
	};

/* Flag for indicating DFU Reset must be performed */
uint8_t boot_to_dfu = 0;
uint8_t switchState = 0;
uint32_t currentValue = 3;
#define BUFFER_SIZE 200
uint8_t *buffer;
unsigned int bufferIndex = 0;


/**
 * @brief  Main function
 */
void main(void) {
	// Initialize device
	initMcu();
	// Initialize board
	initBoard();
	// Initialize application
	initApp();

	// Initialize stack
	gecko_init(&config);

	RETARGET_SerialInit();

	initAdc();
	initGpio();

	buffer = calloc(BUFFER_SIZE, sizeof(uint8_t));

	printf("Start\n");
	while (1) {
		/* Event pointer for handling events */
		struct gecko_cmd_packet* evt;

		/* Check for stack event. */
		evt = gecko_wait_event();

		/* Handle events */
		switch (BGLIB_MSG_ID(evt->header)) {
		/* This boot event is generated when the system boots up after reset.
		 * Do not call any stack commands before receiving the boot event.
		 * Here the system is set to start advertising immediately after boot procedure. */
		case gecko_evt_system_boot_id:
			/* Set advertising parameters. 100ms advertisement interval.
			 * The first two parameters are minimum and maximum advertising interval, both in
			 * units of (milliseconds * 1.6). */
			gecko_cmd_le_gap_set_advertise_timing(0, 160, 160, 0, 0);

			/* Start general advertising and enable connections. */
			gecko_cmd_le_gap_start_advertising(0, le_gap_general_discoverable,
					le_gap_connectable_scannable);

			gecko_cmd_le_gap_start_discovery(le_gap_phy_1m,
					le_gap_discover_observation);

			gecko_cmd_hardware_set_soft_timer(14000, 1, 0); // < 500ms / event id=1 / repeat
			gecko_cmd_hardware_set_soft_timer(14100, 2, 0); // < 500ms / event id=2 / repeat
			gecko_cmd_hardware_set_soft_timer(20000, 3, 0); // > 500ms / event id=3 / repeat
			break;

			/* This event is generated when a connected client has either
			 * 1) changed a Characteristic Client Configuration, meaning that they have enabled
			 * or disabled Notifications or Indications, or
			 * 2) sent a confirmation upon a successful reception of the indication. */
		case gecko_evt_gatt_server_characteristic_status_id:
			/* Check that the characteristic in question is temperature - its ID is defined
			 * in gatt.xml as "temperature_measurement". Also check that status_flags = 1, meaning that
			 * the characteristic client configuration was changed (notifications or indications
			 * enabled or disabled). */
//        if ((evt->data.evt_gatt_server_characteristic_status.characteristic == gattdb_temperature_measurement)
//            && (evt->data.evt_gatt_server_characteristic_status.status_flags == 0x01)) {
//          if (evt->data.evt_gatt_server_characteristic_status.client_config_flags == 0x02) {
//            /* Indications have been turned ON - start the repeating timer. The 1st parameter '32768'
//             * tells the timer to run for 1 second (32.768 kHz oscillator), the 2nd parameter is
//             * the timer handle and the 3rd parameter '0' tells the timer to repeat continuously until
//             * stopped manually.*/
//            gecko_cmd_hardware_set_soft_timer(32768, 0, 0);
//          } else if (evt->data.evt_gatt_server_characteristic_status.client_config_flags == 0x00) {
//            /* Indications have been turned OFF - stop the timer. */
//            gecko_cmd_hardware_set_soft_timer(0, 0, 0);
//          }
//        }
			break;

			/* This event is generated when the software timer has ticked. In this example the temperature
			 * is read after every 1 second and then the indication of that is sent to the listening client. */
		case gecko_evt_hardware_soft_timer_id:
			/* Measure the temperature as defined in the function temperatureMeasure() */
//        temperatureMeasure();
			if (evt->data.evt_hardware_soft_timer.handle == 1) {
				currentValue = getAmpVrms();
				printf("Current: %d\n", currentValue);
				gecko_cmd_gatt_server_send_characteristic_notification(0xff, // all connected devices
						gattdb_current_value, sizeof(currentValue), &currentValue);
			} else if (evt->data.evt_hardware_soft_timer.handle == 2) {
				gecko_cmd_gatt_server_send_characteristic_notification(0xff, // all connected devices
						gattdb_switch_state, sizeof(uint8_t), &switchState);
			} else if(evt->data.evt_hardware_soft_timer.handle == 3) { // Push Button checker
				if(getSwitchButton() == 1) {
					switchState = switchState == 0 ? 1 : 0;
					setSwitch(switchState);
				}
			}
			break;

		case gecko_evt_le_connection_closed_id:
			/* Check if need to boot to dfu mode */
			if (boot_to_dfu) {
				/* Enter to DFU OTA mode */
				gecko_cmd_system_reset(2);
			} else {
				/* Stop timer in case client disconnected before indications were turned off */
				gecko_cmd_hardware_set_soft_timer(0, 0, 0);
				/* Restart advertising after client has disconnected */
				gecko_cmd_le_gap_start_advertising(0,
						le_gap_general_discoverable,
						le_gap_connectable_scannable);
			}
			break;

			/* Events related to OTA upgrading
			 ----------------------------------------------------------------------------- */

			/* Checks if the user-type OTA Control Characteristic was written.
			 * If written, boots the device into Device Firmware Upgrade (DFU) mode. */
		case gecko_evt_gatt_server_user_write_request_id:
			printf("Write request\n");
			if (evt->data.evt_gatt_server_user_write_request.characteristic
					== gattdb_ota_control) {
				/* Set flag to enter to OTA mode */
				boot_to_dfu = 1;
				/* Send response to Write Request */
				gecko_cmd_gatt_server_send_user_write_response(
						evt->data.evt_gatt_server_user_write_request.connection,
						gattdb_ota_control, bg_err_success);

				/* Close connection to enter to DFU OTA mode */
				gecko_cmd_le_connection_close(
						evt->data.evt_gatt_server_user_write_request.connection);
			} else if (evt->data.evt_gatt_server_user_write_request.characteristic == gattdb_switch_state) {

				for (int i = 0; i < evt->data.evt_gatt_server_user_write_request.value.len; i++) {
					printf("%02x ", evt->data.evt_gatt_server_user_write_request.value.data[i]);
				}
				printf("\n");

				if (evt->data.evt_gatt_server_user_write_request.value.data[0] == 0x00) {
					switchState = 0; // turn on
					setSwitch(switchState);
				} else if (evt->data.evt_gatt_server_user_write_request.value.data[0] == 0x01) {
					switchState = 1; // turn off
					setSwitch(switchState);
				} else {
					gecko_cmd_gatt_server_send_user_write_response(
							evt->data.evt_gatt_server_user_write_request.connection,
							gattdb_switch_state, bg_err_att_value_not_allowed // fail
							);
					break;
				}

				gecko_cmd_gatt_server_send_user_write_response(
						evt->data.evt_gatt_server_user_write_request.connection,
						gattdb_switch_state, bg_err_success // success
						);

			}
			break;

		case gecko_evt_le_gap_scan_response_id:
			for (int i = 5; i >= 0; i--) {
				bufferIndex += sprintf(buffer + bufferIndex, "%02x", (uint8) evt->data.evt_le_gap_scan_response.address.addr[i]);
				if (i != 0) {
					buffer[bufferIndex++] = ':';
				}
			}

			bufferIndex += sprintf(buffer + bufferIndex, " %d  ", evt->data.evt_le_gap_scan_response.rssi + 100);
			bufferIndex += sprintf(buffer + bufferIndex, "\r\0");

			gecko_cmd_gatt_server_send_characteristic_notification(
					0xff, // all connected devices
					gattdb_mac_rssi_paris, sizeof(uint8_t) * BUFFER_SIZE,
					buffer);

			memset(buffer, 0, BUFFER_SIZE * sizeof(uint8_t));
			bufferIndex = 0;
			break;

		case gecko_evt_gatt_server_user_read_request_id:
			if (evt->data.evt_gatt_server_user_read_request.characteristic
					== gattdb_mac_rssi_paris) {
				gecko_cmd_gatt_server_send_user_read_response(
						evt->data.evt_gatt_server_user_read_request.connection,
						gattdb_mac_rssi_paris, 0, // if this value is not 0 then value will be ignored
						5, "hello");
			} else if (evt->data.evt_gatt_server_user_read_request.characteristic == gattdb_current_value) {
				currentValue = getAmpVrms();
				gecko_cmd_gatt_server_send_user_read_response(
						evt->data.evt_gatt_server_user_read_request.connection,
						gattdb_current_value, 0, // if this value is not 0 then value will be ignored
						sizeof(currentValue), &currentValue);
			} else if (evt->data.evt_gatt_server_user_read_request.characteristic
					== gattdb_switch_state) {
				gecko_cmd_gatt_server_send_user_read_response(
						evt->data.evt_gatt_server_user_read_request.connection,
						gattdb_switch_state, 0, // if this value is not 0 then value will be ignored
						sizeof(uint8_t), &switchState);
			}
			break;
		default:
			break;
		}
	}
}

/** @} (end addtogroup app) */
/** @} (end addtogroup Application) */
