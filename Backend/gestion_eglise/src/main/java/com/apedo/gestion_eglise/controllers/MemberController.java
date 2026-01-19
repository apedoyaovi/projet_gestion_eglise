package com.apedo.gestion_eglise.controllers;

import com.apedo.gestion_eglise.entities.Member;
import com.apedo.gestion_eglise.services.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {
    @Autowired
    MemberService memberService;

    @GetMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Member createMember(@Valid @RequestBody Member member) {
        String currentUser = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        member.setAddedBy(currentUser);
        return memberService.saveMember(member);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @Valid @RequestBody Member memberDetails) {
        return memberService.getMemberById(id)
                .map(member -> {
                    member.setFirstName(memberDetails.getFirstName());
                    member.setLastName(memberDetails.getLastName());
                    member.setMatricule(memberDetails.getMatricule());
                    member.setEmail(memberDetails.getEmail());
                    member.setPhoneNumber(memberDetails.getPhoneNumber());
                    member.setAddress(memberDetails.getAddress());
                    member.setBirthDate(memberDetails.getBirthDate());
                    member.setGender(memberDetails.getGender());
                    member.setProfession(memberDetails.getProfession());
                    member.setMaritalStatus(memberDetails.getMaritalStatus());
                    member.setMarriageDate(memberDetails.getMarriageDate());
                    member.setMarriagePlace(memberDetails.getMarriagePlace());
                    member.setArrivalDate(memberDetails.getArrivalDate());
                    member.setBaptismDate(memberDetails.getBaptismDate());
                    member.setBaptismLocation(memberDetails.getBaptismLocation());
                    member.setDepartureDate(memberDetails.getDepartureDate());
                    member.setDepartureReason(memberDetails.getDepartureReason());
                    member.setMemberGroup(memberDetails.getMemberGroup());
                    member.setStatus(memberDetails.getStatus());
                    return ResponseEntity.ok(memberService.saveMember(member));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMember(@PathVariable Long id) {
        return memberService.getMemberById(id)
                .map(member -> {
                    memberService.deleteMember(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk-delete")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMembers(@RequestBody List<Long> ids) {
        try {
            memberService.deleteAllMembers(ids);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la suppression groupée");
        }
    }
}
