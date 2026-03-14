# ---------- FRONTEND BUILD ----------
# Use a slimmer, current LTS Node image for the asset build stage to
# reduce OS package exposure compared with the generic node:20 image.
FROM node:22-alpine AS frontend
WORKDIR /app

# adjust if your frontend is in another folder
COPY VacationOptimizer.Server/wwwroot/package*.json ./
RUN npm ci

COPY VacationOptimizer.Server/wwwroot ./
RUN npm run build

# ---------- BACKEND BUILD ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY VacationOptimizer.Server/*.csproj ./VacationOptimizer.Server/
RUN dotnet restore VacationOptimizer.Server/VacationOptimizer.Server.csproj

COPY . ./
WORKDIR /src/VacationOptimizer.Server

# copy built frontend into expected location
COPY --from=frontend /app/dist ./wwwroot/dist

RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# ---------- RUNTIME ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "VacationOptimizer.Server.dll"]
