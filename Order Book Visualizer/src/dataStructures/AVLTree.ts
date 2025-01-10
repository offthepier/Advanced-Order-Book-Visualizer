interface Order {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

class AVLNode {
  orders: Order[];
  price: number;
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;

  constructor(order: Order) {
    this.orders = [order];
    this.price = order.price;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

export class OrderBook {
  private root: AVLNode | null = null;

  private getHeight(node: AVLNode | null): number {
    return node ? node.height : 0;
  }

  private getBalance(node: AVLNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  private rightRotate(y: AVLNode): AVLNode {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

    return x;
  }

  private leftRotate(x: AVLNode): AVLNode {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

    return y;
  }

  addOrder(order: Order): void {
    this.root = this.insertNode(this.root, order);
  }

  private insertNode(node: AVLNode | null, order: Order): AVLNode {
    if (!node) {
      return new AVLNode(order);
    }

    if (order.price === node.price) {
      node.orders.push(order);
      return node;
    }

    if (order.price < node.price) {
      node.left = this.insertNode(node.left, order);
    } else {
      node.right = this.insertNode(node.right, order);
    }

    node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;

    const balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && order.price < node.left!.price) {
      return this.rightRotate(node);
    }

    // Right Right Case
    if (balance < -1 && order.price > node.right!.price) {
      return this.leftRotate(node);
    }

    // Left Right Case
    if (balance > 1 && order.price > node.left!.price) {
      node.left = this.leftRotate(node.left!);
      return this.rightRotate(node);
    }

    // Right Left Case
    if (balance < -1 && order.price < node.right!.price) {
      node.right = this.rightRotate(node.right!);
      return this.leftRotate(node);
    }

    return node;
  }

  toVisualizationData() {
    const data: { nodes: any[], links: any[] } = { nodes: [], links: [] };
    if (!this.root) return data;

    const traverse = (node: AVLNode, id: number) => {
      data.nodes.push({
        id,
        price: node.price,
        orders: node.orders,
        height: node.height
      });

      if (node.left) {
        const leftId = id * 2;
        data.links.push({ source: id, target: leftId });
        traverse(node.left, leftId);
      }

      if (node.right) {
        const rightId = id * 2 + 1;
        data.links.push({ source: id, target: rightId });
        traverse(node.right, rightId);
      }
    };

    traverse(this.root, 1);
    return data;
  }
}