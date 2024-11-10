import createExpress, {Express} from 'express';

export class ApiService {
  private engine: Express;

  async initialize() {
    this.engine = createExpress();

    this.engine.post('/tracker_update', (request, response) => {
      console.log(request, response);
    });

    this.engine.delete('/tracker/:id', (request, response) => {
      console.log(request, response);
    });
  }

  async start() {
    const port = 3300;
    this.engine.listen(port, function(){
      console.log(`Сервер запущен по адресу http://localhost:${port}`);
    });
  }
}


