FROM amazonlinux
MAINTAINER kunishima

WORKDIR /scraping
RUN echo "now building..."
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN set -ex; \
        yum -y update; \
        yum -y install \
            vim \
            nodejs \
            libX11 \
            libXcomposite \ 
            libXcursor \
            libXdamage \
            libXext \
            libXi \
            libXtst \
            cups-libs \
            libXScrnSaver \
            libXrandr \
            alsa-lib \
            pango \
            atk \
            at-spi2-atk \
            gtk3
RUN node -v
COPY ./crowler.js .
COPY ./package.json .
RUN npm install  
CMD ["echo","now runing..."]