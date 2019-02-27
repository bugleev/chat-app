// exports.startServer = done => {
//   httpServer.listen(PORT, () => {
//     LoggerService.log(
//       "Server Started:",
//       "Server started and listening at port 4500"
//     );
//   });

//   ioHandlers = new SocketServer(ioServer);
//   ioHandlers.watchConnection();
//   done();
// };

// exports.stopServer = done => {
//   ioServer.close(() => {
//     httpServer.close(() => {
//       done();
//     });
//   });
// };
