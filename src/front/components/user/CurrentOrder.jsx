import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromOrder, updateItemQuantity } from '../../store/slices/orderSlice';
import PropTypes from 'prop-types';

const CurrentOrder = ({ onFinalize }) => {
    const dispatch = useDispatch();
    const currentOrder = useSelector((state) => state.order.items);
    const total = useSelector((state) => state.order.total);

    const handleRemoveItem = (itemId) => {
        dispatch(removeFromOrder(itemId));
    };

    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity > 0) {
            dispatch(updateItemQuantity({ itemId, quantity: newQuantity }));
        }
    };

    if (currentOrder.length === 0) {
        return (
            <Card className="mb-3">
                <Card.Body>
                    <Card.Text>Your order is empty. Add some items to get started!</Card.Text>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Current Order</h5>
            </Card.Header>
            <ListGroup variant="flush">
                {currentOrder.map((item) => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-0">{item.name}</h6>
                            <small className="text-muted">${item.price}</small>
                        </div>
                        <div className="d-flex align-items-center">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                                -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                                +
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="ms-2"
                                onClick={() => handleRemoveItem(item.id)}
                            >
                                ×
                            </Button>
                        </div>
                    </ListGroup.Item>
                ))}
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <strong>Total:</strong>
                    <strong>${total.toFixed(2)}</strong>
                </ListGroup.Item>
            </ListGroup>
            <Card.Footer>
                <Button
                    variant="primary"
                    className="w-100"
                    onClick={onFinalize}
                    disabled={currentOrder.length === 0}
                >
                    Finalize Order
                </Button>
            </Card.Footer>
        </Card>
    );
};

CurrentOrder.propTypes = {
    onFinalize: PropTypes.func.isRequired,
};

export default CurrentOrder;
