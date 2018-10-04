/*
 * init_adc.c
 *
 *  Created on: Aug 22, 2018
 *      Author: zeroho
 */
// https://github.com/SiliconLabs/peripheral_examples/blob/public/adc/adc_single_letimer_prs_dma/src/main_s1.c
#include <stdio.h>
#include "init_adc.h"
#include "em_adc.h"
#include "em_chip.h"
#include "em_device.h"
#include "em_cmu.h"
#include "em_emu.h"
#include "em_prs.h"
#include "em_ldma.h"
#include "em_letimer.h"

#define adcFreq 16000000
// how many samples get sent at once
#define ADC_DVL
// the number of samples per interrupt
#define ADC_BUFFER_SIZE 8
// Desired letimer interrupt frequency (in Hz)
#define letimerDesired 1000
#define letimerClkFreq	19000000

#define letimerCompare letimerClkFreq / letimerDesired

#define LDMA_CHANNEL 0
#define PRS_CHANNEL 0

// Buffer for ADC single and scan conversion
uint32_t adcBuffer[ADC_BUFFER_SIZE];

LDMA_TransferCfg_t trans;
LDMA_Descriptor_t descr;

void LDMA_IRQHandler(void) {
	// Clear interrupt flag
	int max = adcBuffer[0];
	int min = max;
	for(int i = 0; i < ADC_BUFFER_SIZE; i++) {
		max = (max < adcBuffer[i]) ? adcBuffer[i] : max;
		min = (min > adcBuffer[i]) ? adcBuffer[i] : min;
	}
	printf("Max: %d Min: %d", max, min);

	LDMA_IntClear((1 << LDMA_CHANNEL) << _LDMA_IFC_DONE_SHIFT);
}

void initLetimer(void) {
	// Start LFRC0 and wait until it is stable
	CMU_OscillatorEnable(cmuOsc_LFRCO, true, false);

	// Enable clock to the interface of the low energy modules
	CMU_ClockEnable(cmuClock_HFLE, true);

	// Route the LFRCO clock to LFA (TIMER0)
	CMU_ClockSelectSet(cmuClock_LFA, cmuSelect_LFRCO);

	// Enable clock for LETIMER0
	CMU_ClockEnable(cmuClock_LETIMER0, true);

	LETIMER_Init_TypeDef letimerInit = LETIMER_INIT_DEFAULT;

	// Reload COMP0 on underflow, pulse output, and run in repeat mode
	letimerInit.comp0Top = true;
	letimerInit.ufoa0 = letimerUFOAPulse;
	letimerInit.repMode = letimerRepeatFree;

	// Initialize LETIMER
	LETIMER_Init(LETIMER0, &letimerInit);

	// Need REP0 != 0 to pulse on underflow
	LETIMER_RepeatSet(LETIMER0, 0, 1);

	// Compare on wake-up interval count
	LETIMER_CompareSet(LETIMER0, 0, letimerCompare);

	// Use LETIMER0 as async PRS to trigger ADC in EM2
	CMU_ClockEnable(cmuClock_PRS, true);

//	PRS_SourceAsyncSignalSet(PRS_CHANNEL, PRS_CH_CTRL_SOURCESEL_LETIMER0, PRS_CH_CTRL_SIGSEL_LETIMER0CH0);

}

void initLdma(void) {
	// Enable CMU clock
	CMU_ClockEnable(cmuClock_LDMA, true);

	// Basic LDMA configuration
	LDMA_Init_t ldmaInit = LDMA_INIT_DEFAULT;

	LDMA_Init(&ldmaInit);

	// Transfers trigger off ADC single conversion complete
	trans = (LDMA_TransferCfg_t)LDMA_TRANSFER_CFG_PERIPHERAL(ldmaPeripheralSignal_ADC0_SINGLE);

	descr = (LDMA_Descriptor_t)LDMA_DESCRIPTOR_LINKREL_P2M_BYTE(
			&(ADC0->SINGLEDATA), // source
			adcBuffer, // destination
			ADC_BUFFER_SIZE, // data transfer size
			0); // link relative offset (links to self)

	descr.xfer.ignoreSrec = true; // ignores single requests to save energy
	descr.xfer.size = ldmaCtrlSizeWord; // transfers words instead of bytes

	// Initialize transfer
	LDMA_StartTransfer(LDMA_CHANNEL, &trans, &descr);

	// Clear pending and enable interrupts for LDMA
	NVIC_ClearPendingIRQ(LDMA_IRQn);
	NVIC_EnableIRQ(LDMA_IRQn);
}

//void initAdc() {
//	CMU_ClockEnable(cmuClock_ADC0, true);
//
//	ADC_Init_TypeDef init = ADC_INIT_DEFAULT;
//	ADC_InitSingle_TypeDef initSingle = ADC_INITSINGLE_DEFAULT;
//
//
//	// Modify init structs and initialize
//	init.prescale = ADC_PrescaleCalc(adcFreq, 0); // Init to max ADC clock for Series 1
//
//
//	initSingle.diff       = false;        // single ended
//	initSingle.reference  = adcRef2V5;    // internal 2.5V reference
//	initSingle.resolution = adcRes12Bit;  // 12-bit resolution
//	initSingle.acqTime    = adcAcqTime4;  // set acquisition time to meet minimum requirement
//
//	// Select ADC input. See README for corresponding EXP header pin.
//	initSingle.posSel = adcPosSelAPORT2XCH9;
//
//	ADC_Init(ADC0, &init);
//	ADC_InitSingle(ADC0, &initSingle);
//}
//

//void initADC()  {
//	// Declare init structs
//	ADC_Init_TypeDef init = ADC_INIT_DEFAULT;
//	ADC_InitSingle_TypeDef initSingle = ADC_INITSINGLE_DEFAULT;
//
//	// Enable ADC Clock
//	CMU_ClockEnable(cmuClock_HFPER, true);
//	CMU_ClockEnable(cmuClock_ADC0, true);
//
//	// Select AUXHFRCO for ADC ASYNC mode so it can run in EM2
//	CMU->ADCCTRL = CMU_ADCCTRL_ADC0CLKSEL_AUXHFRCO;
//
//	// Set AUXHFROCO frequency and use it to setup the ADC
//	CMU_AUXHFRCOFreqSet(cmuAUXHFRCOFreq_4M0Hz);
//	init.timebase = ADC_TimebaseCalc(CMU_AUXHFRCOFreqGet());
//	init.prescale = ADC_PrescaleCalc(adcFreq, CMU_AUXHFRCOFreqGet());
//
//	// Let the ADC enable its clock in EM2 when necessary
//	init.em2ClockConfig = adcEm2ClockOnDemand;
//	// DMA is available in EM2 for processing SINGLEFIFO DVL request
//	initSingle.singleDmaEm2Wu = 1;
//
//	// Add external ADC input, See README for corresponding EXP hearder pin
//	initSingle.posSel = adcPosSelAPORT2XCH9;
//
//	// Basic ADC single configuration
//	initSingle.diff = false; // single-ended
//	initSingle.reference = adcRef2V5; // 2.5V reference
//	initSingle.reference = adcRes12Bit; // 12-bit resolution
//	initSingle.acqTime = adcAcqTime4; // set acquisition time to meet minimum requirements
//
////	// Enable PRS trigger and select channel 0
//	initSingle.prsEnable = true;
//	initSingle.prsSel = PRS_CHANNEL;
//
//
//	// Initialize ADC
//	ADC_Init(ADC0, &init);
//	ADC_InitSingle(ADC0, &initSingle);
//
//	// Clear the Single FIFO
//	ADC0->SINGLEFIFOCLEAR = ADC_SINGLEFIFOCLEAR_SINGLEFIFOCLEAR;
//}

void initADC() {
	// Enable ADC0 clock
	CMU_ClockEnable(cmuClock_ADC0, true);

	// Declare init structs
	ADC_Init_TypeDef init = ADC_INIT_DEFAULT;
	ADC_InitSingle_TypeDef initSingle = ADC_INITSINGLE_DEFAULT;

	// Modify init structs and initialize
	init.prescale = ADC_PrescaleCalc(adcFreq, 0); // Init to max ADC clock for Series 1

	initSingle.diff       = false;        // single ended
//	initSingle.reference  = adcRef2V5;    // internal 2.5V reference
	initSingle.reference = adcRef5V;
	initSingle.resolution = adcRes12Bit;  // 12-bit resolution
	initSingle.acqTime    = adcAcqTime4;  // set acquisition time to meet minimum requirements

	// Select ADC input. See README for corresponding EXP header pin.
	initSingle.posSel = adcPosSelAPORT2XCH9;

	ADC_Init(ADC0, &init);
	ADC_InitSingle(ADC0, &initSingle);

	// Enable ADC Single Conversion Complete interrupt
	ADC_IntEnable(ADC0, ADC_IEN_SINGLE);

	// Enable ADC interrupts
	NVIC_ClearPendingIRQ(ADC0_IRQn);
	NVIC_EnableIRQ(ADC0_IRQn);
}
#define BUFSIZE 6000
uint32_t sample;
uint32_t millivolts;
uint16_t index = 0;
uint16_t arr[BUFSIZE] = {0, };
uint16_t max = 0;
uint16_t min = 4096;
uint16_t i = 0;


void ADC0_IRQHandler(void)
{
  // Get ADC result
  sample = ADC_DataSingleGet(ADC0);

  // Calculate input voltage in mV
//  millivolts = (sample * 2500) / 4096;
  millivolts = (sample * 5000) / 4096;
  arr[index] = millivolts;
  index++;
  index%=BUFSIZE;

  // Start next ADC conversion
  ADC_Start(ADC0, adcStartSingle);
}


void initAdc() {
	initADC();
	ADC_Start(ADC0, adcStartSingle);
//	initLdma();
//	initLetimer();
}

uint16_t getAmpVrms() {
	max = 0;
	min = 4096;
	for(i = 0; i < BUFSIZE; i++) {
		max = arr[i] > max ? arr[i] : max;
		min = arr[i] < min ? arr[i] : min;
	}
	// Calculate Amp Vrms
	return (uint16_t)(((max - min)*1000/2.0 * 0.707)/100);
}


//uint32_t getCurrent() {
//	uint32_t sample;
//	uint32_t millivolts;
//
//    // Start ADC conversion
//    ADC_Start(ADC0, adcStartSingle);
//
//    // Wait for conversion to be complete
//    while(!(ADC0->STATUS & _ADC_STATUS_SINGLEDV_MASK));
//
//    // Get ADC result
//    sample = ADC_DataSingleGet(ADC0);
//
//    // Calculate input voltage in mV
//    millivolts = (sample * 2500) / 4096;
//
//    return millivolts;
//
//}
