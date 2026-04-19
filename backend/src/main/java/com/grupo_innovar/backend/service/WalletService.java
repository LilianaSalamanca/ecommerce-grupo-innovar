package com.grupo_innovar.backend.service;

import com.grupo_innovar.backend.model.*;
import com.grupo_innovar.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class WalletService {

    private final UserWalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    public void addCredit(Long userId, BigDecimal amount, Long orderId, String description) {

        UserWallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(
                        UserWallet.builder()
                                .userId(userId)
                                .build()
                ));

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .userId(userId)
                .orderId(orderId)
                .type(TransactionType.CREDIT)
                .amount(amount)
                .description(description)
                .build();

        transactionRepository.save(tx);
    }

    public void useCredit(Long userId, BigDecimal amount, Long orderId) {

        UserWallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet no encontrada"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        WalletTransaction tx = WalletTransaction.builder()
                .userId(userId)
                .orderId(orderId)
                .type(TransactionType.DEBIT)
                .amount(amount)
                .description("Uso de saldo en compra")
                .build();

        transactionRepository.save(tx);
    }

    public BigDecimal getBalance(Long userId) {
        return walletRepository.findByUserId(userId)
                .map(UserWallet::getBalance)
                .orElse(BigDecimal.ZERO);
    }
}