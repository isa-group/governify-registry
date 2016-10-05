@ECHO OFF
docker build -t  isagroup/governify-registry .
docker push isagroup/governify-registry
exit