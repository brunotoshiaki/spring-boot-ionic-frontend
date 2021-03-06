import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PedidoDTO } from '../../models/pedido.dto';
import { CartItem } from '../../models/cart-item';
import { CartService } from '../../services/domain/cart.service';
import { ClienteDTO } from '../../models/cliente.dto';
import { EnderecoDTO } from '../../models/endereco.dto';
import { ClienteService } from '../../services/domain/cliente.service';
import { PedidoService } from '../../services/domain/pedido.service';



@IonicPage()
@Component({
  selector: 'page-confirmacao-pedido',
  templateUrl: 'confirmacao-pedido.html',
})
export class ConfirmacaoPedidoPage {

  pedido: PedidoDTO;
  cartItems: CartItem[];
  cliente: ClienteDTO;
  endereco: EnderecoDTO;
  codpedido: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public cartService: CartService,
    public clienteService: ClienteService,
    public PedidoService: PedidoService) {
    this.pedido = this.navParams.get('pedido');
  }

  ionViewDidLoad() {
    this.cartItems = this.cartService.getCart().items;
    this.clienteService.findById(this.pedido.cliente.id)
      .subscribe(response => {
        //cast para ClienteDTO
        this.cliente = response as ClienteDTO;
        this.endereco = this.findEndereco(this.pedido.enderecoDeEntrega.id, response['enderecos']);
      },
        error => {
          this.navCtrl.setRoot('HomePage');
        })
  }

  private findEndereco(id: string, list: EnderecoDTO[]): EnderecoDTO {
    // procura um elemento na lista dado o id
    let posicao = list.findIndex(x => x.id == id);
    return list[posicao];
  }

  total(): number {
    return this.cartService.total();
  }

  voltar() {
    this.navCtrl.setRoot('CartPage');
  }
  home() {
    this.navCtrl.setRoot('CategoriasPage');
  }

  checkout() {
    this.PedidoService.insert(this.pedido)
      .subscribe(response => {

        this.cartService.createOrClearCart();
        this.codpedido = this.extrairId(response.headers.get('location'));
      },
        error => {
          if (error.status == 403) {
            this.navCtrl.setRoot('HomePage');
          }
        });
  }

  private extrairId(location: string): string {
    //pega a posisao da ultima /
    let posicao = location.lastIndexOf('/');
    return location.substring(posicao + 1, location.length);
  }
}
