CXX :=/usr/local/bin/g++-8
TARGET = dummy_test
OBJECTS = util.o dummy_test.o

util.o: util.cc
	$(CXX) -c util.cc
dummy_test.o: dummy_test.cc 
	$(CXX) -c util.h dummy_test.cc

all : $(TARGET)

$(TARGET): $(OBJECTS)
	$(CXX) -o $@ $+

main.o : main.cc util.h
	$(CXX) -c -o $@ $<


clean:
	rm -rf *.o dummy_test
	rm -rf *.gch
					   

