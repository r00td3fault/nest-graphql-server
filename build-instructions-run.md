## Build
docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build

## Run
docker-compose -f docker-compose.prod.yml --env-file .env.prod up

## Nota
Por defecto, __docker-compose__ usa el archivo ```.env```, por lo que si tienen el archivo .env y lo configuran con sus variables de entorno de producción, bastaría con
```
docker-compose -f docker-compose.prod.yml up --build
```

## Cambiar nombre
```
docker tag <nombre app> <usuario docker hub>/<nombre repositorio>
```
Ingresar a Docker Hub
```
docker login
```

Subir imagen
```
docker push <usuario docker hub>/<nombre repositorio>
```