/*
 * init_gpio.h
 *
 *  Created on: Aug 20, 2018
 *      Author: zeroho
 */

#ifndef INIT_GPIO_H_
#define INIT_GPIO_H_

#define SWITCH 6
#define SWITCH_BUTTON 8
//#define SWITCH_STATE 9
#define POWER_STATE 10



void initpio(void);
void setSwitch(uint8_t value);
void setSwitchState(uint8_t state);
void setPowerState(uint8_t state);
void getSwichButton();



#endif /* INIT_GPIO_H_ */
