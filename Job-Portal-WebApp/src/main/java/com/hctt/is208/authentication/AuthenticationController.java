package com.hctt.is208.authentication;

import com.hctt.is208.authentication.DTO.LoginDTO;
import com.hctt.is208.authentication.DTO.LoginResponseDTO; // Import the new DTO
import com.hctt.is208.authentication.DTO.SignUpDTO;
import com.hctt.is208.user.UserRepository;
import com.hctt.is208.user.users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Import UserDetails
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://127.0.0.1:5501")
@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginDTO loginDto) { // Return type changed to ResponseEntity<?>
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // --- START OF CHANGES ---
            // Get user details from the authenticated object
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Find the full user object from the repository to get the ID
            users user = userRepository.findByUsername(userDetails.getUsername());

            // Create the response object with user ID, username, and roles
            LoginResponseDTO responseDTO = new LoginResponseDTO(
                    user.getId(),
                    userDetails.getUsername(),
                    userDetails.getAuthorities()
            );

            return ResponseEntity.ok(responseDTO);
            // --- END OF CHANGES ---

        } catch (Exception ex) {
            return new ResponseEntity<>("Invalid username or password!", HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignUpDTO signUpDto) {

        if (userRepository.existsByUsername(signUpDto.getUsername())) {
            return new ResponseEntity<>("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(signUpDto.getEmail())) {
            return new ResponseEntity<>("Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        users user = new users();
        user.setName(signUpDto.getName());
        user.setUsername(signUpDto.getUsername());
        user.setEmail(signUpDto.getEmail());
        user.setPassword(passwordEncoder.encode(signUpDto.getPassword()));

        userRepository.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.OK);
    }
}