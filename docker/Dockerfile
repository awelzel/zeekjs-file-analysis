FROM zeek/zeek:7.0

RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	cmake \
	less \
	libpcap-dev


# Extra file analyzers to install
WORKDIR /build
COPY external/spicy-png /build/spicy-png
COPY external/spicy-zip /build/spicy-zip

# Make install does not install scripts, hand mangle a bit :-(
RUN for a in /build/* ; do \
	echo $a; bn=$(basename $a); echo ${bn}; \
	cd $a && mkdir build && cd build && cmake ../ && VERBOSE=1 make install && \
	cd $a && mkdir -p /app/${bn} && cp analyzer/*zeek /app/${bn}; cp analyzer/*sig /app/${bn}/; \
	echo "@load ./${bn}" >> /app/__load__.zeek && \
	rm -rf build; \
done

WORKDIR /app
COPY fapi ./
RUN echo "@load ./api.zeek" >> __load__.zeek

WORKDIR /run
