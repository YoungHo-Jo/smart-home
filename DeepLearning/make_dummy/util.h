#ifndef __UTIL_H__
#define __UTIL_H__
#include <iostream>
#include <vector>
#include <utility>
using namespace std;

typedef pair<int, int> pii;

struct plug_info;


void setCurrentValue(vector<int>&, int, int);
void setCurrent(vector<int>*);

void setBeacon(vector<pii>&);

void setPoint(vector<pii>&);

void setSimpleRoom(vector<pii>&);
void set1RoomOut(vector<pii>&);
void set1RoomIn(vector<pii>&);
void set2RoomOut(vector<pii>&);
void set2RoomIn(vector<pii>&);
void set3RoomOut(vector<pii>&);
void set3RoomIn(vector<pii>&);
void set4RoomOut(vector<pii>&);
void set4RoomIn(vector<pii>&);
void setAisleUp(vector<pii>&);
void setAisleDown(vector<pii>&);

double setRssi(double);
double setDist(pii, pii);

void setDummyData(vector<int>*, vector<int>*);

time_t getCurrentTime(void);

#endif
