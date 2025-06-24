package com.hctt.is208.service;

import com.hctt.is208.DTO.Login.AuthenticationRequest;
import com.hctt.is208.DTO.Login.AuthenticationResponse;
import com.hctt.is208.DTO.Login.IntrospectRequest;
import com.hctt.is208.DTO.Login.IntrospectResponse;
import com.hctt.is208.model.User;
import com.hctt.is208.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class AuthenticationService {
    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);
    @Autowired
    private UserRepository userRepository;

    //@Nonfinal de khong inject
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    public IntrospectResponse authenticateToken(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        JWSVerifier verifier =  new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiredTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier); // trả ra boolean

        IntrospectResponse introspectResponse = new IntrospectResponse();
        //verified valid
        introspectResponse.setValid(verified && expiredTime.after(new Date()));
        return introspectResponse;
    }

    //khúc này lấy password ra phải mã hoá lại 1 lần nữa, có thể không mã hoá cũng được nhưng mã hoá có vẻ hợp ly hon
    public AuthenticationResponse authenticate(AuthenticationRequest request){
        var user = userRepository.findByUsername(request.getUsername());
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        //match
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.get().getPassword());
        //kiểm tra xem có authenticated thành công hay không, cái này cần bổ xung
        //trong truong hop nay mac dinh la true
        var token = generateToken(request.getUsername(), user.get().getRole(), user.get().getId());
        AuthenticationResponse authenticationResponse = new AuthenticationResponse();
        authenticationResponse.setToken(token);
        authenticationResponse.setAuthenticated(authenticated);
        return authenticationResponse;
    }

    //generate token
    private  String generateToken(String userName, String role, String id ){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        // payload
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(userName)
                .claim("userId", id)
                .claim("role", role)
                .issuer("jobportal.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .claim(userName, "custom")
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        }catch (JOSEException e){
            log.error("cannot create token", e);
            throw new RuntimeException(e);
        }
    }
}
