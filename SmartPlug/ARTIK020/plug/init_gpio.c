/*
 * init_gpio.c
 *
 *  Created on: Aug 20, 2018
 *      Author: zeroho
 */


#include "em_gpio.h"
#include "init_gpio.h"
#include <stdio.h>
#include "em_cmu.h"
#include "bsp.h"

//void GPIO_EVEN_IRQHandler(void) {
//
//	printf("even irq handler\n");
//	GPIO_IntClear(GPIO_IntGet());
//}

void initGpio(void) {
	CMU_ClockEnable(cmuClock_GPIO, true);


	GPIO_PinModeSet(gpioPortC, SWITCH, gpioModePushPull, 0); // Switch
	GPIO_PinModeSet(gpioPortC, SWITCH_BUTTON, gpioModeInput, 0); // Switch Button
//
//	GPIO_IntConfig(gpioPortC, SWITCH_BUTTON, true, false, true);
//	NVIC_ClearPendingIRQ(GPIO_EVEN_IRQn);
//	NVIC_EnableIRQ(GPIO_EVEN_IRQn);

//	GPIO_PinModeSet(gpioPortC, SWITCH_STATE, gpioModePushPull, 1); // Switch State LED
	GPIO_PinModeSet(gpioPortC, POWER_STATE, gpioModePushPull, 1); // Power State LED

}

void setSwitch(uint8_t value) {
	printf("Set Switch to %d\n", value);
	if(value == 1) { // turn on
		GPIO_PinOutSet(gpioPortC, SWITCH);
	} else { // turn off
		GPIO_PinOutClear(gpioPortC, SWITCH);
	}

	printf("Switch changed to %d\n", GPIO_PinOutGet(gpioPortC, SWITCH));
	unsigned int v = GPIO_PinInGet(gpioPortC, SWITCH);
	printf("%d\n", v);
}

void setSwitchState(uint8_t state) {
	if(state == 1) { // on
//		GPIO_PinOutSet(gpioPortC, SWITCH_STATE);
	} else { // off
//		GPIO_PinOutClear(gpioPortC, SWITCH_STATE);
	}
}

void setPowerState(uint8_t state) {
	if(state == 1) { // on
		GPIO_PinOutSet(gpioPortC, POWER_STATE);
	} else { // off
		GPIO_PinOutClear(gpioPortC, POWER_STATE);
	}
}

unsigned int getSwitchButton() {
	return GPIO_PinInGet(gpioPortC, SWITCH_BUTTON);
}

